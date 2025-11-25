"use client"

import { useCallback, useEffect, useState } from "react"

import { delay } from "@/lib/utils"

import { useDownloadProof } from "@/lib/hooks/verify-proof/use-download-proof"
import { useDownloadVerificationKey } from "@/lib/hooks/verify-proof/use-download-verification-key"
import { useVerifyProof } from "@/lib/hooks/verify-proof/use-verify-proof"
import { isVerifiableProver } from "@/lib/hooks/verify-proof/verify-proof.utils"

export type VerificationStatus =
  | "idle"
  | "downloading"
  | "verifying"
  | "success"
  | "failed"
  | "error"

interface VerificationResult {
  status: VerificationStatus
  isValid?: boolean
  error?: string
  verifyTime?: string
}

export function useAutoVerifyProof(
  proofId: number,
  clusterId: string,
  proofStatus: string
) {
  const [result, setResult] = useState<VerificationResult>({ status: "idle" })
  const [hasStartedVerification, setHasStartedVerification] = useState(false)
  const { downloadProof } = useDownloadProof()
  const downloadVerificationKey = useDownloadVerificationKey()
  const { verifyProof, isReady } = useVerifyProof(clusterId || "")

  const verify = useCallback(
    async (proofIdToVerify: number) => {
      await delay(100)
      let isMounted = true

      try {
        const startTime = performance.now()
        setHasStartedVerification(true)

        setResult({ status: "downloading" })
        const [proofBytes, vkBytes] = await Promise.all([
          downloadProof(proofIdToVerify),
          downloadVerificationKey(proofIdToVerify),
        ])

        if (!isMounted) {
          return
        }

        if (!proofBytes || !vkBytes) {
          setResult({
            status: "error",
            error: "Failed to download proof or vk",
          })
          return
        }

        setResult({ status: "verifying" })
        await delay(100)

        const verifyResult = await verifyProof(proofBytes, vkBytes)
        const duration = performance.now() - startTime

        if (!isMounted) {
          return
        }

        if (verifyResult.isValid) {
          setResult({
            status: "success",
            isValid: true,
            verifyTime: duration.toFixed(2),
          })
        } else {
          setResult({
            status: "failed",
            isValid: false,
            error: verifyResult.error,
          })
        }
      } catch (error) {
        if (isMounted) {
          setResult({
            status: "error",
            error: error instanceof Error ? error.message : "Unknown error",
          })
        }
      }

      return () => {
        isMounted = false
      }
    },
    [downloadProof, downloadVerificationKey, verifyProof]
  )

  useEffect(() => {
    if (!isReady) {
      return
    }

    if (
      proofStatus !== "proved" ||
      !isVerifiableProver(clusterId) ||
      hasStartedVerification
    ) {
      return
    }

    verify(proofId)
  }, [proofId, clusterId, proofStatus, isReady, hasStartedVerification, verify])

  return result
}
