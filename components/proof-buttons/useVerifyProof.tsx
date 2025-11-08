"use client"

import { useCallback, useState } from "react"

import { usePicoVerifier } from "./verifier-hooks/usePicoVerifier"
import { useZirenVerifier } from "./verifier-hooks/useZirenVerifier"
import { useZiskVerifier } from "./verifier-hooks/useZiskVerifier"
import { getProverType } from "./VerifyButton"

export interface VerificationResult {
  error?: string
  isValid: boolean
  verifyTime?: number
}

export function useVerifyProof(prover: string) {
  const [verifyTime, setVerifyTime] = useState("")
  const proverType = getProverType(prover)

  const verifyPicoProof = usePicoVerifier(
    proverType === "pico" || proverType === "pico-prism"
  )
  const verifyZirenProof = useZirenVerifier(proverType === "ziren")
  const verifyZiskProof = useZiskVerifier(proverType === "zisk")

  const verifyProof = useCallback(
    async (
      proofBytes: Uint8Array,
      vkBytes: Uint8Array
    ): Promise<VerificationResult> => {
      let result: VerificationResult
      try {
        const startTime = performance.now()
        if (proverType === "pico") {
          result = verifyPicoProof("Pico", proofBytes, vkBytes)
        } else if (proverType === "pico-prism") {
          result = verifyPicoProof("PicoPrism", proofBytes, vkBytes)
        } else if (proverType === "ziren") {
          result = verifyZirenProof(proofBytes, vkBytes)
        } else if (proverType === "zisk") {
          result = verifyZiskProof(proofBytes, vkBytes)
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
    [proverType, verifyPicoProof, verifyZirenProof, verifyZiskProof]
  )

  return {
    verifyProof,
    verifyTime,
  }
}
