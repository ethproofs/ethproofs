import { useCallback, useState } from "react"

import { handleBlobRead } from "./utils"

export function useDownloadVerificationKey() {
  const [isDownloading, setIsDownloading] = useState(false)

  return useCallback(
    async (proofId: number) => {
      if (isDownloading) return
      setIsDownloading(true)

      try {
        const response = await fetch(
          `/api/v0/verification-keys/download/${proofId}`
        )
        if (!response.ok) {
          throw new Error(
            `Failed to download vk: ${response.status} ${response.statusText}`
          )
        }
        const blob = await response.blob()
        const vkBytes = await handleBlobRead(blob)

        return vkBytes
      } catch (err) {
        console.error("Error downloading proof:", err)
      } finally {
        setIsDownloading(false)
      }
    },
    [isDownloading]
  )
}
