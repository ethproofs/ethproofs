"use client"

import { useEffect, useState } from "react"

import { useDownloadProof } from "@/components/proof-buttons/useDownloadProof"
import { useDownloadVerificationKey } from "@/components/proof-buttons/useDownloadVerificationKey"
import { useVerifyProof } from "@/components/proof-buttons/useVerifyProof"

import { delay } from "@/lib/utils"

// Prover configuration
const ziskVerifiableProvers = [
  "efa90d57-3269-4d8d-8e9c-947d6c311420",
  "33f14a82-47b7-42d7-9bc1-b81a46eea4fe",
  "c759bbea-e1d7-462c-9fdc-2a47d979e495",
]

const picoVerifiableProvers = ["4eb78a0b-61c1-464f-80f2-20f1f56aea73"]

const picoPrismVerifiableProvers = ["79041a5b-ee8d-49b3-8207-86c7debf8e13"]

const zirenVerifiableProvers = ["84a01f4b-8078-44cf-b463-90ddcd124960"]

const verifiableProvers = [
  ...ziskVerifiableProvers,
  ...picoVerifiableProvers,
  ...picoPrismVerifiableProvers,
  ...zirenVerifiableProvers,
]

function isVerifiableProver(id: string): boolean {
  return verifiableProvers.includes(id)
}

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
