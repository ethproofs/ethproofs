import type { ProverType } from "@/lib/types"

import type { ClusterRow } from "@/components/clusters-table/clusters-table"

import {
  getActiveClustersLatestVersion,
  getProverTypes,
} from "@/lib/api/clusters"
import { getClusterSummary } from "@/lib/api/stats"

export interface ProversTableData {
  clusters: ClusterRow[]
  proverTypes: ProverType[]
}

export async function fetchProversTableData(): Promise<ProversTableData> {
  const [activeClusters, clusterSummary, proverTypes] = await Promise.all([
    getActiveClustersLatestVersion(),
    getClusterSummary(),
    getProverTypes(),
  ])

  const clusters = activeClusters
    .map((cluster) => {
      const stats = clusterSummary.find(
        (summary) => summary.cluster_id === cluster.id
      )
      return {
        ...cluster,
        avg_cost: stats?.avg_cost_per_proof ?? 0,
        avg_time: Number(stats?.avg_proving_time ?? 0),
      }
    })
    .sort((a, b) => {
      if (a.avg_time === 0 && b.avg_time === 0) return 0
      if (a.avg_time === 0) return 1
      if (b.avg_time === 0) return -1
      return a.avg_time - b.avg_time
    })

  return { clusters, proverTypes }
}
