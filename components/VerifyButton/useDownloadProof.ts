import { useCallback, useEffect, useRef, useState } from "react"

// POC test proof - simulate proof download for testing
async function pocDownloadProof(): Promise<Response> {
  return new Promise((resolve) => {
    setTimeout(async () => {
      const response = await fetch("/test-proof.txt")
      if (!response.ok) throw new Error("Failed to fetch")
      console.log("Response:", response)
      resolve(response)
    }, 2000) // 2 seconds delay
  })
}

export function useDownloadProof() {
  const [downloadSpeed, setDownloadSpeed] = useState("")
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)

  const downloadProof = useCallback(async () => {
    if (isDownloading) return
    setIsDownloading(true)
    setDownloadProgress(0)
    setDownloadSpeed("")

    const startTime = performance.now()

    try {
      // Simulate download progress
      const intervalId = setInterval(() => {
        const elapsedTime = (performance.now() - startTime) / 1000 // Seconds
        // Random download speed between 100KB/s and 1MB/s
        const speed = 100 + Math.random() * 900
        setDownloadSpeed((speed / 1000).toFixed(1)) // Convert to MB/s
        // Progress reaches 100% in ~2 seconds
        const progressPercentage = Math.min((elapsedTime / 2) * 100, 100)
        setDownloadProgress(progressPercentage)

        if (progressPercentage >= 100) {
          clearInterval(intervalId)
          setIsDownloading(false)
        }
      }, 50)

      // Simulate proof download
      const response = await pocDownloadProof()
      if (!response.ok) throw new Error("Failed to fetch file")
      if (!response.body) throw new Error("Response body is not streamable")

      return await response.json()
    } catch (err) {
      console.error("Error downloading proof:", err)
      setIsDownloading(false)
      setDownloadProgress(0)
      return null
    }
  }, [isDownloading])

  useEffect(() => {
    return () => {
      setIsDownloading(false)
      setDownloadProgress(0)
      setDownloadSpeed("")
    }
  }, [])

  return { downloadProgress, downloadSpeed, downloadProof }
}
