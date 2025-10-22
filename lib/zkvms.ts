import { Slices, SoftwareDetailItem } from "./types"

import { getActiveClusterCountByZkvmId } from "@/lib/api/clusters"
import { getZkvm, getZkvms } from "@/lib/api/zkvms"

export const getActiveZkvms = async () => {
  const zkvms = await getZkvmsWithUsage()
  const activeZkvms = zkvms.filter((zkvm) => zkvm.activeClusters > 0)
  return activeZkvms
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

export const getZkvmsStats = async () => {
  const zkvms = await getActiveZkvms()
  const zkvmsCount = zkvms.length

  const isas = new Set(zkvms.map((zkvm) => zkvm.isa))

  return {
    count: zkvmsCount,
    isas: Array.from(isas),
  }
}

export const getSlices = (items: SoftwareDetailItem[]) =>
  items
    .sort((a, b) => a.position - b.position)
    .map((item) => ({ level: item.severity })) as Slices

export const UNVERIFIABLE_ZKVM_SLUGS = new Set<string>([])
export function isUnverifiableZkvm(slug: string): boolean {
  return UNVERIFIABLE_ZKVM_SLUGS.has(slug)
}
