"use client"

import { useCallback, useEffect, useState } from "react"

import { wasmCache } from "@/lib/wasm-cache"

export function usePicoVerifier(active: boolean = false) {
  const [wasmModule, setWasmModule] = useState<
    typeof import("@ethproofs/pico-wasm-stark-verifier") | null
  >(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function initializeWasm() {
      if (!active) return

      // Check if already cached and initialized
      if (wasmCache.isModuleLoaded("pico")) {
        const cachedModule = await wasmCache.getModule(
          "pico",
          () => import("@ethproofs/pico-wasm-stark-verifier")
        )
        if (mounted) {
          setWasmModule(cachedModule as typeof import("@ethproofs/pico-wasm-stark-verifier"))
          setIsInitialized(true)
        }
        return
      }

      try {
        setError(null)
        const loadedModule = await wasmCache.getModule(
          "pico",
          () => import("@ethproofs/pico-wasm-stark-verifier"),
          (wasmModule) => (wasmModule as typeof import("@ethproofs/pico-wasm-stark-verifier")).main()
        )

        if (mounted) {
          setWasmModule(loadedModule as typeof import("@ethproofs/pico-wasm-stark-verifier"))
          setIsInitialized(true)
        }
      } catch (error) {
        console.error("[Pico] WASM initialization failed:", error)
        if (mounted) {
          setError(
            error instanceof Error ? error.message : "Unknown error"
          )
        }
      }
    }

    initializeWasm()

    return () => {
      mounted = false
    }
  }, [active])

  return useCallback(
    (proofBytes: Uint8Array, vkBytes: Uint8Array) => {
      if (!wasmModule || !isInitialized) {
        const errorMsg = error || "[Pico] WASM module not initialized"
        return { isValid: false, error: errorMsg }
      }
      try {
        const result = wasmModule.verify_stark("KoalaBear", proofBytes, vkBytes)
        return { isValid: result }
      } catch (err) {
        console.error("[Pico] verify_stark failed:", err)
        return {
          isValid: false,
          error: err instanceof Error ? err.message : "Pico verifier error",
        }
      }
    },
    [wasmModule, isInitialized, error]
  )
}
