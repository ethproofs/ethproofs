"use client"

import { useCallback, useEffect, useState } from "react"

import { usePicoVerifier } from "./verifier-hooks/usePicoVerifier"
import { useZirenVerifier } from "./verifier-hooks/useZirenVerifier"

export interface VerificationResult {
  error?: string
  isValid: boolean
  verifyTime?: number
}

export function useVerifyProof(prover: string) {
  const [verifyTime, setVerifyTime] = useState("")
  const verifyPicoProof = usePicoVerifier(prover === "brevis")
  const verifyZirenProof = useZirenVerifier(prover === "zkm")

  const verifyProof = useCallback(
    async (
      proofBytes: Uint8Array,
      vkBytes: Uint8Array
    ): Promise<VerificationResult> => {
      let result: VerificationResult
      try {
        const startTime = performance.now()
        if (prover === "brevis") {
          result = verifyPicoProof(proofBytes, vkBytes)
        } else if (prover === "zkm") {
          result = verifyZirenProof(proofBytes, vkBytes)
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
    [prover, verifyPicoProof, verifyZirenProof]
  )

  return {
    verifyProof,
    verifyTime,
  }
}
