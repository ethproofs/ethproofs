"use client"

import { useCallback, useEffect, useState } from "react"

export function usePicoVerifier(active: boolean = false) {
  const [wasmModule, setWasmModule] = useState<
    typeof import("@ethproofs/pico-wasm-stark-verifier") | null
  >(null)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    let mounted = true

    async function initializeWasm() {
      if (!active) return
      try {
        console.log("[Pico] Initializing WASM module...")
        const loadedModule = await import("@ethproofs/pico-wasm-stark-verifier")
        loadedModule.main()

        if (mounted) {
          setWasmModule(loadedModule)
          setIsInitialized(true)
          console.log("[Pico] WASM module initialized")
        }
      } catch (error) {
        console.error("[Pico] WASM initialization failed:", error)
        if (mounted) {
          console.error(
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
    (vmType: string, proofBytes: Uint8Array, vkBytes: Uint8Array) => {
      if (!wasmModule || !isInitialized) {
        return { isValid: false, error: "[Pico] WASM module not initialized" }
      }
      try {
        const result = wasmModule.verify_stark(vmType, proofBytes, vkBytes)
        return { isValid: result }
      } catch (err) {
        console.error("[Pico] verify_stark failed:", err)
        return {
          isValid: false,
          error: err instanceof Error ? err.message : "Pico verifier error",
        }
      }
    },
    [wasmModule, isInitialized]
  )
}
