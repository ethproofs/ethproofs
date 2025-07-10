import { useCallback, useState } from "react"

export function useVerifyProof() {
  const [verifyTime, setVerifyTime] = useState("0")

  const verifyProof = useCallback(() => {
    // TODO: Implement proof verifier
    setVerifyTime("000")
  }, [])

  return { verifyTime, verifyProof }
}
