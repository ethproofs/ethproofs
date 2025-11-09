"use client"

import { useEffect, useState } from "react"

import { delay } from "@/lib/utils"

import { useDownloadProof } from "@/hooks/verify-proof/use-download-proof"
import { useDownloadVerificationKey } from "@/hooks/verify-proof/use-download-verification-key"
import { useVerifyProof } from "@/hooks/verify-proof/use-verify-proof"
import { isVerifiableProver } from "@/hooks/verify-proof/verify-proof.utils"

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
  const { verifyProof } = useVerifyProof(clusterId || "")

  useEffect(() => {
    console.log("[Verification] Effect triggered:", {
      proofId,
      clusterId,
      proofStatus,
      isVerifiable: isVerifiableProver(clusterId),
      hasStartedVerification,
    })

    if (
      proofStatus !== "proved" ||
      !isVerifiableProver(clusterId) ||
      hasStartedVerification
    ) {
      console.log("[Verification] Conditions not met")
      return
    }

    let isMounted = true

    async function verify() {
      await delay(100)
      try {
        console.log("[Verification] Starting verification...")
        const startTime = performance.now()
        setHasStartedVerification(true)

        setResult({ status: "downloading" })
        const [proofBytes, vkBytes] = await Promise.all([
          downloadProof(proofId),
          downloadVerificationKey(proofId),
        ])

        console.log("[Verification] Download complete:", {
          proofBytesLength: proofBytes?.length,
          vkBytesLength: vkBytes?.length,
        })

        if (!isMounted) {
          console.log("[Verification] Component unmounted during download")
          return
        }

        if (!proofBytes || !vkBytes) {
          console.error("[Verification] Missing proof or vk")
          setResult({
            status: "error",
            error: "Failed to download proof or vk",
          })
          return
        }

        console.log("[Verification] Starting verification...")
        setResult({ status: "verifying" })
        await delay(100)

        const verifyResult = await verifyProof(proofBytes, vkBytes)
        const duration = performance.now() - startTime

        console.log("[Verification] Verification result:", verifyResult)

        if (!isMounted) {
          console.log("[Verification] Component unmounted during verification")
          return
        }

        if (verifyResult.isValid) {
          console.log("[Verification] Verification succeeded")
          setResult({
            status: "success",
            isValid: true,
            verifyTime: duration.toFixed(2),
          })
        } else {
          console.log("[Verification] Verification failed:", verifyResult.error)
          setResult({
            status: "failed",
            isValid: false,
            error: verifyResult.error,
          })
        }
      } catch (error) {
        console.error("[Verification] Error during verification:", error)
        if (isMounted) {
          setResult({
            status: "error",
            error: error instanceof Error ? error.message : "Unknown error",
          })
        }
      }
    }

    verify()

    return () => {
      isMounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proofId, clusterId, proofStatus])

  return result
}
