import { getActiveClusterCountByZkvmId } from "@/lib/api/clusters"
import { getZkvm, getZkvms } from "@/lib/api/zkvms"
import { Slices, SoftwareItem } from "./types"

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

export const getZkvmWithUsage = async ({
  id,
  slug,
}: {
  id?: number
  slug?: string
}) => {
  const zkvm = await getZkvm({ id, slug })

  if (!zkvm) {
    return null
  }

  const clusterCount = await getActiveClusterCountByZkvmId()

  const totalClusters = clusterCount.reduce(
    (acc, curr) => acc + curr.active_clusters,
    0
  )

  const activeClusters =
    clusterCount.find((c) => c.zkvm_id === zkvm.id)?.active_clusters || 0

  return {
    ...zkvm,
    totalClusters,
    activeClusters,
  }
}

export const getSlices = (items: SoftwareItem[]) =>
  items
    .sort((a, b) => a.position - b.position)
    .map((item) => ({ level: item.severity })) as Slices
