import { ClusterDetails } from "@/lib/types"

import { sumArray } from "@/lib/utils"

// We had to shorten the names of the relations to avoid a bug in
// drizzle: https://github.com/drizzle-team/drizzle-orm/issues/2066
// TODO: remove it once it's fixed
export const tmp_renameClusterConfiguration = <
  T extends object,
  U extends object,
  V extends object,
>(
  cluster: T & {
    cc: (U & { ci: V })[]
  }
) => {
  const { cc, ...clusterWithoutCC } = cluster
  return {
    ...clusterWithoutCC,
    cluster_configuration: cc.map(tmp_renameCloudInstances),
  }
}

export const tmp_renameCloudInstances = <T extends object, U extends object>(
  clusterConfig: T & { ci: U }
) => {
  const { ci, ...clusterConfigWithoutCI } = clusterConfig
  return {
    ...clusterConfigWithoutCI,
    cloud_instance: ci,
  }
}

export interface ActiveCluster {
  id: string
  nickname: string
  description: string | null
  isOpenSource: boolean
  isMultiMachine: boolean
  version: {
    createdAt: string
  }
  team: {
    id: string
    name: string
    logoUrl: string | null
  }
  zkvm: {
    id: number
    name: string
    isa: string
    version: string
    slug: string
  }
  machines: Array<{
    id: number
    cpuModel: string | null
    cpuCores: number | null
    gpuModels: string[] | null
    gpuCount: number[] | null
    gpuRam: number[] | null
    memorySizeGb: number[] | null
    memoryCount: number[] | null
    count: number | null
  }>
}

export function transformClusters(
  activeClusters: ActiveCluster[],
  clusterSummary: {
    cluster_id: string | null
    avg_cost_per_proof: number | null
    avg_proving_time: string | null
  }[]
): ClusterDetails[] {
  return activeClusters.map((cluster) => {
    const stats = clusterSummary.find(
      (summary) => summary.cluster_id === cluster.id
    )

    return {
      id: cluster.id,
      name: cluster.nickname,
      versionDate: cluster.version.createdAt,
      isOpenSource: cluster.isOpenSource,
      isMultiMachine: cluster.isMultiMachine,
      avgCost: stats?.avg_cost_per_proof ?? 0,
      avgTime: Number(stats?.avg_proving_time ?? 0),
      team: {
        id: cluster.team.id,
        name: cluster.team.name,
        logoUrl: cluster.team.logoUrl,
      },
      zkvm: {
        id: cluster.zkvm.id,
        name: cluster.zkvm.name,
        slug: cluster.zkvm.slug,
      },
      machines: cluster.machines.map((machine) => ({
        id: Number(machine.id),
        cpuModel: machine.cpuModel ?? "",
        cpuCount: machine.cpuCores ?? 0,
        cpuRam: sumArray(machine.memorySizeGb ?? []),
        gpuCount: machine.gpuCount ?? [],
        gpuModels: machine.gpuModels ?? [],
        gpuRam: machine.gpuRam ?? [],
        count: machine.count ?? 1,
      })),
    }
  })
}
