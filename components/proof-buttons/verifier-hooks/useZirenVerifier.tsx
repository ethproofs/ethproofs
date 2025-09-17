"use client"

import { useCallback, useEffect, useState } from "react"

import { wasmCache } from "@/lib/wasm-cache"

export function useZirenVerifier(active: boolean = false) {
  const [wasmModule, setWasmModule] = useState<
    typeof import("@ethproofs/ziren-wasm-stark-verifier") | null
  >(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function initializeWasm() {
      if (!active) return

      // Check if already cached and initialized
      if (wasmCache.isModuleLoaded("ziren")) {
        const cachedModule = await wasmCache.getModule(
          "ziren",
          () => import("@ethproofs/ziren-wasm-stark-verifier")
        )
        if (mounted) {
          setWasmModule(cachedModule as typeof import("@ethproofs/ziren-wasm-stark-verifier"))
          setIsInitialized(true)
        }
        return
      }

      try {
        setError(null)
        const loadedModule = await wasmCache.getModule(
          "ziren",
          () => import("@ethproofs/ziren-wasm-stark-verifier"),
          (wasmModule) => (wasmModule as typeof import("@ethproofs/ziren-wasm-stark-verifier")).main()
        )

        if (mounted) {
          setWasmModule(loadedModule as typeof import("@ethproofs/ziren-wasm-stark-verifier"))
          setIsInitialized(true)
        }
      } catch (error) {
        console.error("[Ziren] WASM initialization failed:", error)
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
        const errorMsg = error || "[Ziren] WASM module not initialized"
        return { isValid: false, error: errorMsg }
      }
      try {
        const result = wasmModule.verify_stark(proofBytes, vkBytes)
        return { isValid: result }
      } catch (err) {
        console.error("[Ziren] verify_stark failed:", err)
        return {
          isValid: false,
          error: err instanceof Error ? err.message : "Ziren verifier error",
        }
      }
    },
    [wasmModule, isInitialized, error]
  )
}
