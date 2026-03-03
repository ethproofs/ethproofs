import type { ClusterSummary } from "@/lib/types"

import { getActiveClusters } from "./clusters"

export async function getActiveClustersByZkvmIds(
  zkvmIds: number[]
): Promise<Record<number, ClusterSummary[]>> {
  const allClusters = await getActiveClusters()

  const clustersByZkvmId: Record<number, ClusterSummary[]> = {}
  for (const zkvmId of zkvmIds) {
    clustersByZkvmId[zkvmId] = []
  }

  for (const cluster of allClusters) {
    const clusterZkvmIds = new Set(
      cluster.versions.map((v) => v.zkvm_version.zkvm.id)
    )
    for (const zkvmId of zkvmIds) {
      if (clusterZkvmIds.has(zkvmId)) {
        clustersByZkvmId[zkvmId].push({
          id: cluster.id,
          name: cluster.name,
          team: {
            name: cluster.team.name,
            slug: cluster.team.slug,
          },
        })
      }
    }
  }

  return clustersByZkvmId
}
