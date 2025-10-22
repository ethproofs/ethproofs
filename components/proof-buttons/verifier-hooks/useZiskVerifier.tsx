"use client"

import { useCallback, useEffect, useState } from "react"

export function useZiskVerifier(active: boolean = false) {
  const [wasmModule, setWasmModule] = useState<
    typeof import("@ethproofs/zisk-wasm-stark-verifier") | null
  >(null)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    let mounted = true

    async function initializeWasm() {
      if (!active) return
      try {
        console.log("[Zisk] Initializing WASM module...")
        const loadedModule = await import("@ethproofs/zisk-wasm-stark-verifier")
        loadedModule.main()

        if (mounted) {
          setWasmModule(loadedModule)
          setIsInitialized(true)
          console.log("[Zisk] WASM module initialized")
        }
      } catch (error) {
        console.error("[Zisk] WASM initialization failed:", error)
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
    (proofBytes: Uint8Array, vkBytes: Uint8Array) => {
      if (!wasmModule || !isInitialized) {
        return { isValid: false, error: "[Zisk] WASM module not initialized" }
      }
      try {
        const result = wasmModule.verify_stark(proofBytes, vkBytes)
        return { isValid: result }
      } catch (err) {
        console.error("[Zisk] verify_stark failed:", err)
        return {
          isValid: false,
          error: err instanceof Error ? err.message : "Zisk verifier error",
        }
      }
    },
    [wasmModule, isInitialized]
  )
}
