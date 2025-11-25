"use client"

import { useCallback, useEffect, useState } from "react"

import { wasmCache } from "@/lib/wasm-cache"

export function useOpenVmVerifier(active: boolean = false) {
  const [wasmModule, setWasmModule] = useState<
    typeof import("@ethproofs/openvm-wasm-stark-verifier") | null
  >(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function initializeWasm() {
      if (!active) return

      // Check if already cached and initialized
      if (wasmCache.isModuleLoaded("openvm")) {
        const cachedModule = await wasmCache.getModule(
          "openvm",
          () => import("@ethproofs/openvm-wasm-stark-verifier")
        )
        if (mounted) {
          setWasmModule(
            cachedModule as typeof import("@ethproofs/openvm-wasm-stark-verifier")
          )
          setIsInitialized(true)
        }
        return
      }

      try {
        setError(null)
        const loadedModule = await wasmCache.getModule(
          "openvm",
          () => import("@ethproofs/openvm-wasm-stark-verifier"),
          (wasmModule) =>
            (
              wasmModule as typeof import("@ethproofs/openvm-wasm-stark-verifier")
            ).main()
        )

        if (mounted) {
          setWasmModule(
            loadedModule as typeof import("@ethproofs/openvm-wasm-stark-verifier")
          )
          setIsInitialized(true)
        }
      } catch (error) {
        console.error("[OpenVM] WASM initialization failed:", error)
        if (mounted) {
          setError(error instanceof Error ? error.message : "Unknown error")
        }
      }
    }

    initializeWasm()

    return () => {
      mounted = false
    }
  }, [active])

  const verifyFn = useCallback(
    (proofBytes: Uint8Array, vkBytes: Uint8Array) => {
      if (!wasmModule || !isInitialized) {
        const errorMsg = error || "[OpenVM] WASM module not initialized"
        return { isValid: false, error: errorMsg }
      }
      try {
        const result = wasmModule.verify_stark(proofBytes, vkBytes)
        return { isValid: result }
      } catch (err) {
        console.error("[OpenVM] verify_stark failed:", err)
        return {
          isValid: false,
          error: err instanceof Error ? err.message : "OpenVM verifier error",
        }
      }
    },
    [wasmModule, isInitialized, error]
  )

  return { verifyFn, isInitialized }
}
