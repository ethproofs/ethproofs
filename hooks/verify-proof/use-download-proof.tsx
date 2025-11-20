import { useCallback, useEffect, useState } from "react"

import { delay } from "@/lib/utils"

import { handleBlobRead } from "./verify-proof.utils"

export function useDownloadProof() {
  const [downloadSpeed, setDownloadSpeed] = useState("0")
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)

  // Simulate download progress for UX feedback bc downloads are fast
  const simulateDownload = useCallback(async () => {
    for (let i = 0; i <= 100; i += 10) {
      const speed = 100 + Math.random() * 900
      setDownloadSpeed((speed / 1000).toFixed(1)) // MB/s
      setDownloadProgress(i)
      await delay(100)
    }
  }, [])

  const downloadProof = useCallback(
    async (proofId: number, saveToFile: boolean = false) => {
      if (isDownloading) return
      setDownloadProgress(0)
      setIsDownloading(true)
      setDownloadSpeed("0")

      await simulateDownload()

      try {
        let lastError: Error | null = null
        const maxRetries = 5
        const baseDelay = 500 // ms

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
          try {
            const response = await fetch(`/api/proofs/download/${proofId}`)
            if (!response.ok) {
              // If it's a 404 and we haven't exhausted retries, retry
              if (response.status === 404 && attempt < maxRetries) {
                lastError = new Error(
                  `Proof not yet available (attempt ${attempt + 1}/${maxRetries + 1})`
                )
                const delayMs = baseDelay * Math.pow(2, attempt) // exponential backoff
                await delay(delayMs)
                continue
              }
              throw new Error(
                `Failed to download proof: ${response.status} ${response.statusText}`
              )
            }
            const blob = await response.blob()
            const proofBytes = await handleBlobRead(blob)

            if (saveToFile) {
              const contentDisposition = response.headers.get(
                "Content-Disposition"
              )
              const filename =
                contentDisposition?.match(/filename="?([^"]*)"?/)?.[1] ||
                `proof_${proofId}.txt`

              const downloadUrl = URL.createObjectURL(blob)
              const a = document.createElement("a")
              a.href = downloadUrl
              a.download = filename
              document.body.appendChild(a)
              a.click()
              a.remove()
              URL.revokeObjectURL(downloadUrl)
            }
            return proofBytes
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

        throw lastError || new Error("Failed to download proof after retries")
      } catch (err) {
        console.error("Error downloading proof:", err)
      } finally {
        setDownloadProgress(0)
        setIsDownloading(false)
        setDownloadSpeed("0")
      }
    },
    [isDownloading, simulateDownload]
  )

  useEffect(() => {
    return () => {
      setDownloadProgress(0)
      setIsDownloading(false)
      setDownloadSpeed("0")
    }
  }, [])

  return { downloadProgress, downloadSpeed, downloadProof }
}
