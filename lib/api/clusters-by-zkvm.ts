import { unstable_cache as cache } from "next/cache"

import type { ClusterSummary } from "@/lib/types"

import { TAGS } from "@/lib/constants"

import { getActiveClusters } from "./clusters"

export const getActiveClustersByZkvmIds = cache(
  async (zkvmIds: number[]): Promise<Record<number, ClusterSummary[]>> => {
    const clustersByZkvmId: Record<number, ClusterSummary[]> = {}

    await Promise.all(
      zkvmIds.map(async (zkvmId) => {
        const clusters = await getActiveClusters({ zkvmId })
        clustersByZkvmId[zkvmId] = clusters.map((cluster) => ({
          id: cluster.id,
          name: cluster.name,
          team: {
            name: cluster.team.name,
            slug: cluster.team.slug,
          },
        }))
      })
    )

    return clustersByZkvmId
  },
  ["active-clusters-by-zkvm-ids"],
  {
    revalidate: 60 * 60 * 24,
    tags: [TAGS.CLUSTERS],
  }
)
