import { db } from "@/db"
import { getTeam } from "@/lib/api/teams"
import { downloadVerificationKey } from "@/lib/api/verification-keys"

// Server-side vk cache - keyed by clusterId and versionIndex to reuse across proofs
const vkCache: Map<string, Uint8Array> = new Map()

// Track in-flight downloads to prevent redundant network calls
const vkDownloadInProgress: Map<string, Promise<Uint8Array>> = new Map()

// Cache configuration
const MAX_VK_CACHE_ENTRIES = 100 // Maximum number of VK entries to cache
const MAX_VK_CACHE_BYTES = 500 * 1024 * 1024 // 500MB limit

// Helper function to create a unique cache key
function getCacheKey(clusterId: string, versionIndex: number): string {
  return `${clusterId}_${versionIndex}`
}

export async function getCachedVk(
  proofId: number,
  clusterId: string,
  versionIndex: number
): Promise<Uint8Array> {
  const cacheKey = getCacheKey(clusterId, versionIndex)

  // Check if we have this vk cached
  if (vkCache.has(cacheKey)) {
    return vkCache.get(cacheKey)!
  }

  // Check if a download is already in progress for this cluster version
  if (vkDownloadInProgress.has(cacheKey)) {
    return vkDownloadInProgress.get(cacheKey)!
  }

  // Start a new download
  const downloadPromise = downloadVkForCluster(
    proofId,
    clusterId,
    versionIndex
  ).finally(() => {
    // Clean up the in-progress tracker when done
    vkDownloadInProgress.delete(cacheKey)
  })

  vkDownloadInProgress.set(cacheKey, downloadPromise)

  return downloadPromise
}

async function downloadVkForCluster(
  proofId: number,
  clusterId: string,
  versionIndex: number
): Promise<Uint8Array> {
  try {
    const proofRow = await db.query.proofs.findFirst({
      columns: {
        team_id: true,
      },
      where: (proofs, { eq }) => eq(proofs.proof_id, proofId),
    })

    if (!proofRow) {
      throw new Error(`Proof not found: ${proofId}`)
    }

    const team = await getTeam(proofRow.team_id)
    const teamSlug = team?.slug
      ? team.slug
      : (team?.name?.toLowerCase() ?? "unknown")
    const filename = `${teamSlug}_${clusterId}_${versionIndex}.bin`

    const blob = await downloadVerificationKey(filename)

    if (!blob) {
      throw new Error(`vk file not found in storage: ${filename}`)
    }

    const buffer = await blob.arrayBuffer()
    const vkBytes = new Uint8Array(buffer)

    // Cache it by cluster and version for future use, enforcing cache limits
    const cacheKey = getCacheKey(clusterId, versionIndex)
    addToCache(cacheKey, vkBytes)

    return vkBytes
  } catch (err) {
    console.error(
      `Failed to get vk for cluster ${clusterId} version ${versionIndex}:`,
      err
    )
    throw err
  }
}

function addToCache(cacheKey: string, vkBytes: Uint8Array) {
  // If entry already exists, remove it first to update position (LRU)
  if (vkCache.has(cacheKey)) {
    vkCache.delete(cacheKey)
  }

  // Enforce entry count limit
  if (vkCache.size >= MAX_VK_CACHE_ENTRIES) {
    const oldestKey = Array.from(vkCache.keys())[0]
    if (oldestKey) {
      vkCache.delete(oldestKey)
    }
  }

  // Enforce byte size limit
  const totalBytes = Array.from(vkCache.values()).reduce(
    (sum, vk) => sum + vk.byteLength,
    0
  )
  if (totalBytes + vkBytes.byteLength > MAX_VK_CACHE_BYTES) {
    const oldestKey = Array.from(vkCache.keys())[0]
    if (oldestKey) {
      vkCache.delete(oldestKey)
    }
  }

  vkCache.set(cacheKey, vkBytes)
}

export function clearVkCache() {
  vkCache.clear()
}

export function getVkCacheStats() {
  const totalBytes = Array.from(vkCache.values()).reduce(
    (sum, vk) => sum + vk.byteLength,
    0
  )

  return {
    entries: vkCache.size,
    bytes: totalBytes,
    bytesFormatted: formatBytes(totalBytes),
    clusters: Array.from(vkCache.keys()),
    limits: {
      maxEntries: MAX_VK_CACHE_ENTRIES,
      maxBytes: MAX_VK_CACHE_BYTES,
      maxBytesFormatted: formatBytes(MAX_VK_CACHE_BYTES),
    },
  }
}

function formatBytes(bytes: number): string {
  const units = ["B", "KB", "MB", "GB"]
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`
}
