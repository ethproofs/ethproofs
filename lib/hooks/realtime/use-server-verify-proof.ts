"use client"

import { useCallback, useRef } from "react"
import { useEffect, useState } from "react"

export type ServerVerificationStatus =
  | "idle"
  | "downloading"
  | "verifying"
  | "complete"
  | "error"

interface ServerVerificationResult {
  status: ServerVerificationStatus
  isValid?: boolean
  error?: string
  verifyTime?: number
}

export function useServerVerifyProof(proofId: number) {
  const eventSourceRef = useRef<EventSource | null>(null)
  const [result, setResult] = useState<ServerVerificationResult>({
    status: "idle",
  })

  const verify = useCallback(async () => {
    setResult({ status: "idle" })

    try {
      // Close any existing connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }

      const eventSource = new EventSource(`/api/verify/proofs/${proofId}`)
      eventSourceRef.current = eventSource

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data)

        setResult({
          status: data.status,
          isValid: data.isValid,
          error: data.error,
          verifyTime: data.verifyTime,
        })

        // Close connection when done
        if (data.status === "complete" || data.status === "error") {
          eventSource.close()
          eventSourceRef.current = null
        }
      }

      eventSource.onerror = (error) => {
        console.error("[useServerVerifyProof] EventSource error:", error)
        eventSource.close()
        eventSourceRef.current = null
        setResult({
          status: "error",
          error: "Connection error during verification",
        })
      }
    } catch (err) {
      console.error("[useServerVerifyProof] Error:", err)
      setResult({
        status: "error",
        error: err instanceof Error ? err.message : "Verification failed",
      })
    }
  }, [proofId])

  // Cleanup EventSource on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }
    }
  }, [])

  return { result, verify }
}
