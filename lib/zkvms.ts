import { getActiveClusterCountByZkvmId } from "@/lib/api/clusters"
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

  const clusterCount = await getActiveClusterCountByZkvmId()

  const totalActiveClusters = clusterCount.reduce(
    (acc, curr) => acc + curr.active_clusters,
    0
  )

  const zkvmsWithUsage = zkvms.map((zkvm) => {
    const activeClusters =
      clusterCount.find((c) => c.zkvm_id === zkvm.id)?.active_clusters || 0
    const totalClusters = totalActiveClusters
    return { ...zkvm, totalClusters, activeClusters }
  })
  return zkvmsWithUsage
}
