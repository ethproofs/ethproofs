import { useCallback, useState } from "react"

import { delay } from "@/lib/utils"

import { handleBlobRead } from "./verify-proof.utils"

export function useDownloadVerificationKey() {
  const [isDownloading, setIsDownloading] = useState(false)

  return useCallback(
    async (proofId: number) => {
      if (isDownloading) return
      setIsDownloading(true)

      try {
        let lastError: Error | null = null
        const maxRetries = 5
        const baseDelay = 500 // ms

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
          try {
            const response = await fetch(
              `/api/verification-keys/download/${proofId}`
            )
            if (!response.ok) {
              // If it's a 404 and we haven't exhausted retries, retry
              if (response.status === 404 && attempt < maxRetries) {
                lastError = new Error(
                  `Verification key not yet available (attempt ${attempt + 1}/${maxRetries + 1})`
                )
                const delayMs = baseDelay * Math.pow(2, attempt) // exponential backoff
                await delay(delayMs)
                continue
              }
              throw new Error(
                `Failed to download vk: ${response.status} ${response.statusText}`
              )
            }
            const blob = await response.blob()
            const vkBytes = await handleBlobRead(blob)

            return vkBytes
          } catch (err) {
            lastError = err instanceof Error ? err : new Error(String(err))
            // If it's the last attempt or not a retryable error, throw
            if (
              attempt === maxRetries ||
              !(err instanceof Error) ||
              !err.message.includes("not yet available")
            ) {
              throw err
            }
          }
        }

        throw (
          lastError ||
          new Error("Failed to download verification key after retries")
        )
      } catch (err) {
        // Only log actual errors, not 404s (those are expected during retries)
        if (
          err instanceof Error &&
          !err.message.includes("not yet available")
        ) {
          console.error("Error downloading verification key:", err)
        }
      } finally {
        setIsDownloading(false)
      }
    },
    [isDownloading]
  )
}
