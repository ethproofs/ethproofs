import { and, count, desc, eq, exists, gt, sql } from "drizzle-orm"

import { db } from "@/db"
import {
  clusterMachines,
  clusters,
  clusterVersions,
  machines,
  proofs,
  teams,
  zkvms,
  zkvmVersions,
} from "@/db/schema"

export const getCluster = async (id: string) => {
  const cluster = await db.query.clusters.findFirst({
    where: (clusters, { eq }) => eq(clusters.id, id),
  })

  return cluster
}

export const getClusters = async () => {
  const clusters = await db.query.clusters.findMany({
    with: {
      team: true,
      versions: {
        orderBy: desc(clusterVersions.created_at),
        with: {
          zkvm_version: {
            with: {
              zkvm: true,
            },
          },
        },
      },
    },
  })
  return clusters
}

export const getActiveClusters = async () => {
  const thirtyDaysAgo = sql`NOW() - INTERVAL '30 days'`

  const rawRows = await db
    .select({
      // Cluster info
      id: clusters.id,
      nickname: clusters.nickname,
      description: clusters.description,
      isOpenSource: clusters.is_open_source,
      createdAt: clusters.created_at,

      // Team info
      teamId: teams.id,
      teamName: teams.name,
      teamLogoUrl: teams.logo_url,

      // ZKVM info
      zkvmId: zkvms.id,
      zkvmName: zkvms.name,
      zkvmIsa: zkvms.isa,
      zkvmVersion: zkvmVersions.version,

      // Machine info
      machineId: machines.id,
      cpuModel: machines.cpu_model,
      cpuCores: machines.cpu_cores,
      gpuModels: machines.gpu_models,
      gpuCount: machines.gpu_count,
      memorySizeGb: machines.memory_size_gb,
      memoryCount: machines.memory_count,
      machineCount: clusterMachines.machine_count,
    })
    .from(clusters)
    .innerJoin(teams, eq(clusters.team_id, teams.id))
    .innerJoin(clusterVersions, eq(clusters.id, clusterVersions.cluster_id))
    .innerJoin(
      zkvmVersions,
      eq(clusterVersions.zkvm_version_id, zkvmVersions.id)
    )
    .innerJoin(zkvms, eq(zkvmVersions.zkvm_id, zkvms.id))
    .leftJoin(
      clusterMachines,
      eq(clusterVersions.id, clusterMachines.cluster_version_id)
    )
    .leftJoin(machines, eq(clusterMachines.machine_id, machines.id))
    .where(
      exists(
        db
          .select()
          .from(proofs)
          .where(
            and(
              eq(proofs.cluster_version_id, clusterVersions.id),
              eq(proofs.proof_status, "proved"),
              gt(proofs.proved_timestamp, thirtyDaysAgo)
            )
          )
      )
    )

  const clusterMap = new Map<
    string,
    Omit<
      (typeof rawRows)[number],
      | "machineId"
      | "cpuModel"
      | "cpuCores"
      | "gpuModels"
      | "gpuCount"
      | "memorySizeGb"
      | "memoryCount"
      | "machineCount"
    > & {
      machines: Array<{
        id: NonNullable<(typeof rawRows)[number]["machineId"]>
        cpuModel: (typeof rawRows)[number]["cpuModel"]
        cpuCores: (typeof rawRows)[number]["cpuCores"]
        gpuModels: (typeof rawRows)[number]["gpuModels"]
        gpuCount: (typeof rawRows)[number]["gpuCount"]
        memorySizeGb: (typeof rawRows)[number]["memorySizeGb"]
        memoryCount: (typeof rawRows)[number]["memoryCount"]
        count: (typeof rawRows)[number]["machineCount"]
      }>
    }
  >()

  for (const row of rawRows) {
    if (!clusterMap.has(row.id)) {
      // Create new cluster entry
      clusterMap.set(row.id, {
        id: row.id,
        nickname: row.nickname,
        description: row.description,
        isOpenSource: row.isOpenSource,
        createdAt: row.createdAt,
        teamId: row.teamId,
        teamName: row.teamName,
        teamLogoUrl: row.teamLogoUrl,
        zkvmId: row.zkvmId,
        zkvmName: row.zkvmName,
        zkvmIsa: row.zkvmIsa,
        zkvmVersion: row.zkvmVersion,
        machines: [],
      })
    }

    const cluster = clusterMap.get(row.id)!

    // Add machine if it exists
    if (row.machineId) {
      cluster.machines.push({
        id: row.machineId,
        cpuModel: row.cpuModel,
        cpuCores: row.cpuCores,
        gpuModels: row.gpuModels,
        gpuCount: row.gpuCount,
        memorySizeGb: row.memorySizeGb,
        memoryCount: row.memoryCount,
        count: row.machineCount ?? 1,
      })
    }
  }

  return Array.from(clusterMap.values())
}

export const getClustersByTeamId = async (teamId: string) => {
  const clusters = await db.query.clusters.findMany({
    where: (clusters, { eq }) => eq(clusters.team_id, teamId),
  })

  return clusters
}

export const getActiveClusterCountByZkvmId = async () => {
  const thirtyDaysAgo = sql`NOW() - INTERVAL '30 days'`

  const result = await db
    .select({
      zkvm_id: zkvms.id,
      active_clusters: sql<number>`CAST(COUNT(DISTINCT ${clusters.id}) AS int)`,
    })
    .from(zkvms)
    .leftJoin(zkvmVersions, eq(zkvms.id, zkvmVersions.zkvm_id))
    .leftJoin(
      clusterVersions,
      eq(zkvmVersions.id, clusterVersions.zkvm_version_id)
    )
    .leftJoin(clusters, eq(clusterVersions.cluster_id, clusters.id))
    .where(
      exists(
        db
          .select()
          .from(proofs)
          .where(
            and(
              eq(proofs.cluster_version_id, clusterVersions.id),
              eq(proofs.proof_status, "proved"),
              gt(proofs.created_at, thirtyDaysAgo)
            )
          )
      )
    )
    .groupBy(zkvms.id)

  return result
}

// Those machines that at least have 1 proof submitted with status "proved"
export const getActiveMachineCount = async () => {
  const [machineCount] = await db
    .select({ count: count() })
    .from(clusterMachines)
    .where(
      exists(
        db
          .select()
          .from(proofs)
          .innerJoin(
            clusterVersions,
            eq(proofs.cluster_version_id, clusterVersions.id)
          )
          .where(
            and(
              eq(clusterMachines.cluster_version_id, clusterVersions.id),
              eq(proofs.proof_status, "proved")
            )
          )
      )
    )

  return machineCount.count
}
