import { useCallback, useEffect, useState } from "react"

export function useDownloadProof() {
  const [downloadSpeed, setDownloadSpeed] = useState("0")
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)

  // Simulate download for button animation
  const simulateDownload = useCallback(async () => {
    for (let i = 0; i <= 100; i += 10) {
      const speed = 100 + Math.random() * 900
      setDownloadSpeed((speed / 1000).toFixed(1)) // MB/s
      setDownloadProgress(i)
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
  }, [])

  const downloadProof = useCallback(
    async (proofId: number) => {
      if (isDownloading) return
      setDownloadProgress(0)
      setIsDownloading(true)
      setDownloadSpeed("")

      await simulateDownload()

      try {
        const response = await fetch(`/api/v0/proofs/download/${proofId}`)
        const blob = await response.blob()

        const downloadUrl = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = downloadUrl
        a.download = `${response.url.split("proof_binaries/")[1]}`
        document.body.appendChild(a)
        a.click()
        a.remove()
        URL.revokeObjectURL(downloadUrl)
      } catch (err) {
        console.error("Error downloading proof:", err)
        setIsDownloading(false)
        setDownloadProgress(0)
        return null
      }
    },
    [isDownloading]
  )

  useEffect(() => {
    return () => {
      setIsDownloading(false)
      setDownloadProgress(0)
      setDownloadSpeed("")
    }
  }, [])

  return { downloadProgress, downloadSpeed, downloadProof }
}
