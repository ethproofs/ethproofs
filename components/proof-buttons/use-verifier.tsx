"use client"

import { useCallback, useEffect, useState } from "react"

import { wasmCache } from "@/lib/wasm-cache"
import type { VerifiableZkvmSlug } from "@/lib/zkvm-verifiers"

interface WasmModule {
  main: () => void
  verify_stark: (
    ...args: [Uint8Array, Uint8Array] | [string, Uint8Array, Uint8Array]
  ) => boolean
}

// Static import mapping for bundler compatibility
// Typed as Promise<WasmModule> since actual module signatures differ
// (zisk takes 2 params, pico takes 3) but we handle both via the union type
const MODULE_LOADERS: Record<VerifiableZkvmSlug, () => Promise<WasmModule>> = {
  zisk: () =>
    import("@ethproofs/zisk-wasm-stark-verifier") as Promise<WasmModule>,
  pico: () =>
    import("@ethproofs/pico-wasm-stark-verifier") as Promise<WasmModule>,
  ziren: () =>
    import("@ethproofs/ziren-wasm-stark-verifier") as Promise<WasmModule>,
  "sp1-hypercube": () =>
    import("@ethproofs/sp1-hypercube-wasm-verifier") as Promise<WasmModule>,
  openvm: () =>
    import("@ethproofs/openvm-wasm-stark-verifier") as Promise<WasmModule>,
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

      // Check if already cached and initialized
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
          (wasmModule) => (wasmModule as WasmModule).main()
        )

        if (mounted) {
          setWasmModule(loadedModule as WasmModule)
          setIsInitialized(true)
        }
      } catch (error) {
        if (mounted) {
          setError(error instanceof Error ? error.message : "Unknown error")
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

        switch (zkvmSlug) {
          case "pico":
            result = wasmModule.verify_stark("PicoPrism", proofBytes, vkBytes)
            break
          default:
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
