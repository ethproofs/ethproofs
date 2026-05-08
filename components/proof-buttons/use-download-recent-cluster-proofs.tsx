import { useCallback } from "react"

export function useDownloadRecentClusterProofs() {
  const downloadRecentClusterProofs = useCallback(
    async (clusterId: string, limit: number) => {
      try {
        const response = await fetch(
          `/api/v0/proofs/download/cluster/${clusterId}?limit=${limit}`
        )
        if (!response.ok) {
          throw new Error(
            `Failed to download proofs: ${response.status} ${response.statusText}`
          )
        }
        const blob = await response.blob()

        const downloadUrl = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = downloadUrl
        a.download = `${clusterId}_recent_proofs`
        document.body.appendChild(a)
        a.click()
        a.remove()
        URL.revokeObjectURL(downloadUrl)

        await new Promise((resolve) => setTimeout(resolve, 100))
      } catch (err) {
        console.error("Error downloading proofs:", err)
        return null
      }
    },
    []
  )

  return downloadRecentClusterProofs
}
