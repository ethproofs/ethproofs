import { and, count, desc, eq, exists, gt, sql } from "drizzle-orm"

import { db } from "@/db"
import {
  clusterMachines,
  clusters,
  clusterVersions,
  proofs,
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
