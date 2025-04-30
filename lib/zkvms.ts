import { ClusterBase, ClusterVersionBase } from "./types"

import { getClusters } from "@/lib/api/clusters"
import { getZkvms } from "@/lib/api/zkvms"

export const getZkvmsStats = async () => {
  const zkvms = await getZkvms()
  const zkvmsCount = zkvms.length

  const isas = new Set(zkvms.map((zkvm) => zkvm.isa))

  return {
    count: zkvmsCount,
    isas: Array.from(isas),
  }
}

export const getZkvmsWithUsage = async () => {
  const zkvms = await getZkvms({ limit: 10 })

  const clusters = await getClusters()

  const clustersByZkvmId = clusters.reduce(
    (acc, cluster) => {
      const zkvmId = cluster.versions[0].zkvm_version.zkvm.id
      if (!acc[zkvmId]) {
        acc[zkvmId] = []
      }
      acc[zkvmId].push(cluster)
      return acc
    },
    {} as Record<number, (ClusterBase & { versions: ClusterVersionBase[] })[]>
  )

  const zkvmsWithUsage = zkvms.map((zkvm) => {
    const zkvmClusters = clustersByZkvmId[zkvm.id].length
    const totalClusters = clusters.length
    return { ...zkvm, totalClusters, zkvmClusters }
  })
  return zkvmsWithUsage
}
