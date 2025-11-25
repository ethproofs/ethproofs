"use client"

import { useCallback, useMemo, useState } from "react"

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
    }
    return true // Unknown prover type, treat as ready to fail fast
  }, [
    proverType,
    picoVerifier.isInitialized,
    sp1HypercubeVerifier.isInitialized,
    zirenVerifier.isInitialized,
    ziskVerifier.isInitialized,
    openVmVerifier.isInitialized,
  ])

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
        } else if (proverType === "sp1-hypercube") {
          result = sp1HypercubeVerifier.verifyFn(proofBytes, vkBytes)
        } else if (proverType === "ziren") {
          result = zirenVerifier.verifyFn(proofBytes, vkBytes)
        } else if (proverType === "zisk") {
          result = ziskVerifier.verifyFn(proofBytes, vkBytes)
        } else if (proverType === "openvm") {
          result = openVmVerifier.verifyFn(proofBytes, vkBytes)
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
    ]
  )

  return {
    verifyProof,
    verifyTime,
    isReady,
  }
}
