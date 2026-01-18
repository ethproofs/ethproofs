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

interface VerifyResult {
  isValid: boolean
  error?: string
}

export function useVerifier(
  zkvmSlug: VerifiableZkvmSlug | undefined,
  active: boolean = false
) {
  const [wasmModule, setWasmModule] = useState<WasmModule | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function initializeWasm() {
      if (!active || !zkvmSlug) return

      const moduleLoader = MODULE_LOADERS[zkvmSlug]

      if (wasmCache.isModuleLoaded(zkvmSlug)) {
        const cachedModule = await wasmCache.getModule(zkvmSlug, moduleLoader)
        if (mounted) {
          setWasmModule(cachedModule as WasmModule)
          setIsInitialized(true)
        }
        return
      }

      try {
        setError(null)
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

  const verifyFn = useCallback(
    (proofBytes: Uint8Array, vkBytes: Uint8Array): VerifyResult => {
      if (!wasmModule || !isInitialized || !zkvmSlug) {
        const errorMsg =
          error || `[${zkvmSlug || "Unknown"}] WASM module not initialized`
        return { isValid: false, error: errorMsg }
      }

      try {
        let result: boolean
        if (zkvmSlug === "pico") {
          result = wasmModule.verify_stark("PicoPrism", proofBytes, vkBytes)
        } else if (isVerifiableZkvmWithoutVk(zkvmSlug)) {
          result = wasmModule.verify_stark(proofBytes)
        } else {
          result = wasmModule.verify_stark(proofBytes, vkBytes)
        }

        return { isValid: result }
      } catch (err) {
        return {
          isValid: false,
          error:
            err instanceof Error ? err.message : `${zkvmSlug} verifier error`,
        }
      }
    },
    [wasmModule, isInitialized, error, zkvmSlug]
  )

  return { verifyFn, isInitialized }
}
