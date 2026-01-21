"use client"

import { useCallback, useEffect, useState } from "react"

import { wasmCache } from "@/lib/wasm-cache"
import {
  isVerifiableZkvmWithoutVk,
  type VerifiableZkvmSlug,
} from "@/lib/zkvm-verifiers"

interface WasmModule {
  main(): void
  verify_stark(
    ...args:
      | [Uint8Array]
      | [Uint8Array, Uint8Array]
      | [string, Uint8Array, Uint8Array]
  ): boolean
}

const MODULE_LOADERS: Record<VerifiableZkvmSlug, () => Promise<unknown>> = {
  zisk: () => import("@ethproofs/zisk-wasm-stark-verifier"),
  pico: () => import("@ethproofs/pico-wasm-stark-verifier"),
  ziren: () => import("@ethproofs/ziren-wasm-stark-verifier"),
  "sp1-hypercube": () => import("@ethproofs/sp1-hypercube-wasm-verifier"),
  openvm: () => import("@ethproofs/openvm-wasm-stark-verifier"),
  airbender: () => import("@ethproofs/airbender-wasm-stark-verifier"),
}

// Fallback module loaders for backwards compatibility
const FALLBACK_MODULE_LOADERS: Partial<
  Record<VerifiableZkvmSlug, () => Promise<unknown>>
> = {
  zisk: () => import("@ethproofs/zisk-wasm-stark-verifier-v0.12.0"),
}

interface VerifyResult {
  isValid: boolean
  error?: string
}

export function useVerifier(
  zkvmSlug: VerifiableZkvmSlug | undefined,
  active: boolean = false
) {
  const [wasmModule, setWasmModule] = useState<WasmModule | null>(null)
  const [fallbackModule, setFallbackModule] = useState<WasmModule | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function initializeWasm() {
      if (!active || !zkvmSlug) return

      const moduleLoader = MODULE_LOADERS[zkvmSlug]
      const fallbackLoader = FALLBACK_MODULE_LOADERS[zkvmSlug]
      const fallbackCacheKey = `${zkvmSlug}-fallback`

      // Check if primary module is already cached
      if (wasmCache.isModuleLoaded(zkvmSlug)) {
        const cachedModule = await wasmCache.getModule(zkvmSlug, moduleLoader)
        if (mounted) {
          setWasmModule(cachedModule as WasmModule)
        }

        // Also load fallback if available and cached
        if (fallbackLoader && wasmCache.isModuleLoaded(fallbackCacheKey)) {
          const cachedFallback = await wasmCache.getModule(
            fallbackCacheKey,
            fallbackLoader
          )
          if (mounted) {
            setFallbackModule(cachedFallback as WasmModule)
          }
        }

        if (mounted) {
          setIsInitialized(true)
        }
        return
      }

      try {
        setError(null)

        // Load primary module
        const loadedModule = await wasmCache.getModule(
          zkvmSlug,
          moduleLoader,
          (wasmModule) => {
            const mod = wasmModule as { main?: () => void }
            if (mod.main) {
              mod.main()
            }
          }
        )

        if (mounted) {
          setWasmModule(loadedModule as WasmModule)
        }

        // Load fallback module if available (non-blocking)
        if (fallbackLoader) {
          wasmCache
            .getModule(fallbackCacheKey, fallbackLoader, (wasmModule) => {
              const mod = wasmModule as { main?: () => void }
              if (mod.main) {
                mod.main()
              }
            })
            .then((loadedFallback) => {
              if (mounted) {
                setFallbackModule(loadedFallback as WasmModule)
              }
            })
            .catch((err) => {
              // Fallback load failure is not critical
              console.warn(
                `Failed to load fallback module for ${zkvmSlug}:`,
                err
              )
            })
        }

        if (mounted) {
          setIsInitialized(true)
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Unknown error")
        }
      }
    }

    initializeWasm()

    return () => {
      mounted = false
    }
  }, [active, zkvmSlug])

  const verifyWithModule = useCallback(
    (
      module: WasmModule,
      proofBytes: Uint8Array,
      vkBytes: Uint8Array
    ): boolean => {
      if (zkvmSlug === "pico") {
        return module.verify_stark("PicoPrism", proofBytes, vkBytes)
      } else if (isVerifiableZkvmWithoutVk(zkvmSlug!)) {
        return module.verify_stark(proofBytes)
      } else {
        return module.verify_stark(proofBytes, vkBytes)
      }
    },
    [zkvmSlug]
  )

  const verifyFn = useCallback(
    (proofBytes: Uint8Array, vkBytes: Uint8Array): VerifyResult => {
      if (!wasmModule || !isInitialized || !zkvmSlug) {
        const errorMsg =
          error || `[${zkvmSlug || "Unknown"}] WASM module not initialized`
        return { isValid: false, error: errorMsg }
      }

      // Try primary module first
      try {
        const result = verifyWithModule(wasmModule, proofBytes, vkBytes)
        if (result) {
          return { isValid: true }
        }
      } catch (primaryErr) {
        // Primary verification failed, try fallback if available
        if (fallbackModule) {
          try {
            const fallbackResult = verifyWithModule(
              fallbackModule,
              proofBytes,
              vkBytes
            )
            if (fallbackResult) {
              return { isValid: true }
            }
          } catch (fallbackErr) {
            console.error(fallbackErr)
            // Both failed, return primary error
            return {
              isValid: false,
              error:
                primaryErr instanceof Error
                  ? primaryErr.message
                  : `${zkvmSlug} verifier error`,
            }
          }
        }

        return {
          isValid: false,
          error:
            primaryErr instanceof Error
              ? primaryErr.message
              : `${zkvmSlug} verifier error`,
        }
      }

      // Primary returned false, try fallback
      if (fallbackModule) {
        try {
          const fallbackResult = verifyWithModule(
            fallbackModule,
            proofBytes,
            vkBytes
          )
          return { isValid: fallbackResult }
        } catch {
          // Fallback also failed, return primary result (false)
          return { isValid: false }
        }
      }

      return { isValid: false }
    },
    [
      wasmModule,
      fallbackModule,
      isInitialized,
      error,
      zkvmSlug,
      verifyWithModule,
    ]
  )

  return { verifyFn, isInitialized }
}
