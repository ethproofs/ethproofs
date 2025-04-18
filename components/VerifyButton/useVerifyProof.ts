import { useCallback, useState } from "react"
import * as zkp from "micro-zk-proofs"

import {
  prepareProofDataOld,
  prepareVkey,
  zkmJsonVkey,
  zkmTestProof,
} from "@/utils/verify-proof/verify-zkm-proof"

// POC test proof
function pocVerifyProof(proof: unknown) {
  const pws = prepareProofDataOld(proof) as zkp.ProofWithSignals
  const vkey = prepareVkey(zkmJsonVkey) as zkp.VerificationKey
  return zkp.bn254.groth.verifyProof(vkey, pws)
}

export function useVerifyProof() {
  const [verifyTime, setVerifyTime] = useState("")

  const verifyProof = useCallback((proof: unknown) => {
    const startTime = performance.now()

    try {
      return pocVerifyProof(proof)
    } catch (error) {
      console.log("Error verifying proof:", error)
    } finally {
      const endTime = performance.now()
      setVerifyTime((endTime - startTime).toFixed(2))
    }
  }, [])

  return { verifyTime, verifyProof }
}
