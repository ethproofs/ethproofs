"use client"

import { useCallback, useState } from "react"

import { usePicoVerifier } from "./verifier-hooks/usePicoVerifier"
import { useZirenVerifier } from "./verifier-hooks/useZirenVerifier"
import { useZiskVerifier } from "./verifier-hooks/useZiskVerifier"
import { VERIFIABLE_PROVERS } from "./VerifyButton"

export interface VerificationResult {
  error?: string
  isValid: boolean
  verifyTime?: number
}

export function useVerifyProof(prover: string) {
  const [verifyTime, setVerifyTime] = useState("")
  const verifyPicoProof = usePicoVerifier(
    prover === VERIFIABLE_PROVERS.brevis ||
      prover === VERIFIABLE_PROVERS.brevisMultiGpu
  )
  const verifyZirenProof = useZirenVerifier(prover === VERIFIABLE_PROVERS.zkm)
  const verifyZiskProof = useZiskVerifier(
    prover === VERIFIABLE_PROVERS.zisk ||
      prover === VERIFIABLE_PROVERS.ziskMultiGpu ||
      prover === VERIFIABLE_PROVERS.zkcloud
  )

  const verifyProof = useCallback(
    async (
      proofBytes: Uint8Array,
      vkBytes: Uint8Array
    ): Promise<VerificationResult> => {
      let result: VerificationResult
      try {
        const startTime = performance.now()
        if (prover === VERIFIABLE_PROVERS.brevis) {
          result = verifyPicoProof("Pico", proofBytes, vkBytes)
        } else if (prover === VERIFIABLE_PROVERS.brevisMultiGpu) {
          result = verifyPicoProof("PicoPrism", proofBytes, vkBytes)
        } else if (prover === VERIFIABLE_PROVERS.zkm) {
          result = verifyZirenProof(proofBytes, vkBytes)
        } else if (
          prover === VERIFIABLE_PROVERS.zisk ||
          prover === VERIFIABLE_PROVERS.ziskMultiGpu ||
          prover === VERIFIABLE_PROVERS.zkcloud
        ) {
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
    [prover, verifyPicoProof, verifyZirenProof, verifyZiskProof]
  )

  return {
    verifyProof,
    verifyTime,
  }
}
