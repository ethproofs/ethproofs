"use client"

import { useCallback, useEffect, useState } from "react"

export interface VerificationResult {
  error?: string
  isValid: boolean
  verifyTime?: number
}

export function useVerifyProof() {
  const [wasmModule, setWasmModule] = useState<
    typeof import("@ethproofs/pico-wasm-stark-verifier") | null
  >(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const [initError, setInitError] = useState<string | null>(null)
  const [verifyTime, setVerifyTime] = useState("")

  useEffect(() => {
    let mounted = true

    async function initializeWasm() {
      try {
        console.log("Initializing WASM module...")
        const loadedModule = await import("@ethproofs/pico-wasm-stark-verifier")
        loadedModule.main()

        if (mounted) {
          setWasmModule(loadedModule)
          setIsInitialized(true)
          setIsInitializing(false)
          console.log("WASM module initialized")
        }
      } catch (error) {
        console.error("WASM initialization failed:", error)
        if (mounted) {
          setInitError(error instanceof Error ? error.message : "Unknown error")
          setIsInitializing(false)
        }
      }
    }

    initializeWasm()

    return () => {
      mounted = false
    }
  }, [])

  // TODO: Handle multiple zkVM verifiers
  const verifyProof = useCallback(
    async (
      proofBytes: Uint8Array,
      vkBytes: Uint8Array
    ): Promise<VerificationResult> => {
      if (!wasmModule || !isInitialized) {
        return { isValid: false, error: "WASM module not initialized" }
      }

      try {
        const startTime = performance.now()
        const result = wasmModule.verify_koalabear(proofBytes, vkBytes)
        const duration = performance.now() - startTime
        setVerifyTime(duration.toFixed(2))

        return {
          isValid: result,
        }
      } catch (error) {
        return {
          isValid: false,
          error: error instanceof Error ? error.message : "Verification failed",
        }
      }
    },
    [wasmModule, isInitialized]
  )

  return {
    isInitialized,
    isInitializing,
    initError,
    verifyProof,
    verifyTime,
  }
}
