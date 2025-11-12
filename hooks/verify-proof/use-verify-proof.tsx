"use client"

import { useCallback, useMemo, useState } from "react"

import { usePicoVerifier } from "./verifier-hooks/usePicoVerifier"
import { useZirenVerifier } from "./verifier-hooks/useZirenVerifier"
import { useZiskVerifier } from "./verifier-hooks/useZiskVerifier"
import { getProverType } from "./verify-proof.utils"

export interface VerificationResult {
  error?: string
  isValid: boolean
  verifyTime?: number
}

export function useVerifyProof(prover: string) {
  const [verifyTime, setVerifyTime] = useState("")
  const proverType = getProverType(prover)

  const picoVerifier = usePicoVerifier(
    proverType === "pico" || proverType === "pico-prism"
  )
  const zirenVerifier = useZirenVerifier(proverType === "ziren")
  const ziskVerifier = useZiskVerifier(proverType === "zisk")

  // Check if the active verifier is initialized
  const isReady = useMemo(() => {
    if (proverType === "pico" || proverType === "pico-prism") {
      return picoVerifier.isInitialized
    } else if (proverType === "ziren") {
      return zirenVerifier.isInitialized
    } else if (proverType === "zisk") {
      return ziskVerifier.isInitialized
    }
    return true // Unknown prover type, treat as ready to fail fast
  }, [proverType, picoVerifier.isInitialized, zirenVerifier.isInitialized, ziskVerifier.isInitialized])

  const verifyProof = useCallback(
    async (
      proofBytes: Uint8Array,
      vkBytes: Uint8Array
    ): Promise<VerificationResult> => {
      let result: VerificationResult
      try {
        const startTime = performance.now()
        if (proverType === "pico") {
          result = picoVerifier.verifyFn("Pico", proofBytes, vkBytes)
        } else if (proverType === "pico-prism") {
          result = picoVerifier.verifyFn("PicoPrism", proofBytes, vkBytes)
        } else if (proverType === "ziren") {
          result = zirenVerifier.verifyFn(proofBytes, vkBytes)
        } else if (proverType === "zisk") {
          result = ziskVerifier.verifyFn(proofBytes, vkBytes)
        } else {
          result = { isValid: false, error: "Proof cannot be verified" }
        }
        const duration = performance.now() - startTime
        setVerifyTime(duration.toFixed(2))
        return result
      } catch (error) {
        return {
          isValid: false,
          error: error instanceof Error ? error.message : "Verification failed",
        }
      }
    },
    [proverType, picoVerifier, zirenVerifier, ziskVerifier]
  )

  return {
    verifyProof,
    verifyTime,
    isReady,
  }
}
