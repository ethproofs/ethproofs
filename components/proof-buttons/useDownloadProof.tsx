import { useCallback, useEffect, useState } from "react"

import { delay } from "@/lib/utils"

import { handleBlobRead } from "./utils"

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
        const response = await fetch(`/api/v0/proofs/download/${proofId}`)
        if (!response.ok) {
          throw new Error(
            `Failed to download proof: ${response.status} ${response.statusText}`
          )
        }
        const blob = await response.blob()
        const proofBytes = await handleBlobRead(blob)

        if (saveToFile) {
          const contentDisposition = response.headers.get("Content-Disposition")
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
