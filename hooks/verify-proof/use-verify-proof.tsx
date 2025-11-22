"use client"

import { useCallback, useMemo, useState } from "react"

import { useAirbenderVerifier } from "./verifier-hooks/use-airbender-verifier"
import { useOpenVmVerifier } from "./verifier-hooks/use-openvm-verifier"
import { usePicoVerifier } from "./verifier-hooks/use-pico-verifier"
import { useSp1HypercubeVerifier } from "./verifier-hooks/use-sp1-hypercube-verifier"
import { useZirenVerifier } from "./verifier-hooks/use-ziren-verifier"
import { useZiskVerifier } from "./verifier-hooks/use-zisk-verifier"
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
  const sp1HypercubeVerifier = useSp1HypercubeVerifier(
    proverType === "sp1-hypercube"
  )
  const zirenVerifier = useZirenVerifier(proverType === "ziren")
  const ziskVerifier = useZiskVerifier(proverType === "zisk")
  const openVmVerifier = useOpenVmVerifier(proverType === "openvm")
  const airbenderVerifier = useAirbenderVerifier(proverType === "airbender")

  // Check if the active verifier is initialized
  const isReady = useMemo(() => {
    if (proverType === "pico" || proverType === "pico-prism") {
      return picoVerifier.isInitialized
    } else if (proverType === "sp1-hypercube") {
      return sp1HypercubeVerifier.isInitialized
    } else if (proverType === "ziren") {
      return zirenVerifier.isInitialized
    } else if (proverType === "zisk") {
      return ziskVerifier.isInitialized
    } else if (proverType === "openvm") {
      return openVmVerifier.isInitialized
    } else if (proverType === "airbender") {
      return airbenderVerifier.isInitialized
    }
    return true // Unknown prover type, treat as ready to fail fast
  }, [
    proverType,
    picoVerifier.isInitialized,
    sp1HypercubeVerifier.isInitialized,
    zirenVerifier.isInitialized,
    ziskVerifier.isInitialized,
    openVmVerifier.isInitialized,
    airbenderVerifier.isInitialized,
  ])

  const verifyProof = useCallback(
    async (
      proofBytes: Uint8Array,
      vkBytes?: Uint8Array
    ): Promise<VerificationResult> => {
      let result: VerificationResult
      try {
        const startTime = performance.now()
        if (proverType === "pico") {
          if (!vkBytes) return { isValid: false, error: "VK is required" }
          result = picoVerifier.verifyFn("Pico", proofBytes, vkBytes)
        } else if (proverType === "pico-prism") {
          if (!vkBytes) return { isValid: false, error: "VK is required" }
          result = picoVerifier.verifyFn("PicoPrism", proofBytes, vkBytes)
        } else if (proverType === "sp1-hypercube") {
          if (!vkBytes) return { isValid: false, error: "VK is required" }
          result = sp1HypercubeVerifier.verifyFn(proofBytes, vkBytes)
        } else if (proverType === "ziren") {
          if (!vkBytes) return { isValid: false, error: "VK is required" }
          result = zirenVerifier.verifyFn(proofBytes, vkBytes)
        } else if (proverType === "zisk") {
          if (!vkBytes) return { isValid: false, error: "VK is required" }
          result = ziskVerifier.verifyFn(proofBytes, vkBytes)
        } else if (proverType === "openvm") {
          if (!vkBytes) return { isValid: false, error: "VK is required" }
          result = openVmVerifier.verifyFn(proofBytes, vkBytes)
        } else if (proverType === "airbender") {
          result = airbenderVerifier.verifyFn(proofBytes)
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
    [
      proverType,
      picoVerifier,
      sp1HypercubeVerifier,
      zirenVerifier,
      ziskVerifier,
      openVmVerifier,
      airbenderVerifier,
    ]
  )

  return {
    verifyProof,
    verifyTime,
    isReady,
  }
}
