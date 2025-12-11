"use client"

import { useCallback, useState } from "react"

import { useVerifier } from "./use-verifier"

import { type VerifiableZkvmSlug } from "@/lib/zkvm-verifiers"

export interface VerificationResult {
  error?: string
  isValid: boolean
  verifyTime?: number
}

export function useVerifyProof(zkvmSlug: VerifiableZkvmSlug | undefined) {
  const [verifyTime, setVerifyTime] = useState("")

  const { verifyFn, isInitialized } = useVerifier(
    zkvmSlug,
    zkvmSlug !== undefined
  )

  const verifyProof = useCallback(
    async (
      proofBytes: Uint8Array,
      vkBytes: Uint8Array
    ): Promise<VerificationResult> => {
      try {
        const startTime = performance.now()

        const result = zkvmSlug
          ? verifyFn(proofBytes, vkBytes)
          : { isValid: false, error: "No zkvm slug provided" }

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
    [zkvmSlug, verifyFn]
  )

  return {
    verifyProof,
    verifyTime,
    isReady: isInitialized,
  }
}
