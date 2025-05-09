import { and, count, desc, eq, exists, gt, sql } from "drizzle-orm"
import { unstable_cache as cache } from "next/cache"

import { db } from "@/db"
import {
  clusterMachines,
  clusters,
  clusterVersions,
  proofs,
  teams,
  zkvms,
  zkvmVersions,
} from "@/db/schema"

export const getCluster = async (id: string) => {
  const cluster = await db.query.clusters.findFirst({
    where: (clusters, { eq }) => eq(clusters.id, id),
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
          cluster_machines: {
            with: {
              machine: true,
              cloud_instance: {
                with: {
                  provider: true,
                },
              },
            },
          },
        },
      },
    },
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
          cluster_machines: {
            with: {
              machine: true,
            },
          },
        },
      },
    },
  })

  return clusters
}

export const getActiveClusters = cache(
  async (filters?: { teamId?: string; zkvmId?: number }) => {
    const { teamId, zkvmId } = filters ?? {}
    const sevenDaysAgo = sql`NOW() - INTERVAL '7 days'`

    return db.query.clusters.findMany({
      where: (clusters, { and }) =>
        and(
          exists(
            db
              .select()
              .from(proofs)
              .innerJoin(
                clusterVersions,
                eq(proofs.cluster_version_id, clusterVersions.id)
              )
              .innerJoin(
                zkvmVersions,
                eq(clusterVersions.zkvm_version_id, zkvmVersions.id)
              )
              .innerJoin(zkvms, eq(zkvmVersions.zkvm_id, zkvms.id))
              .where(
                and(
                  eq(clusterVersions.cluster_id, clusters.id),
                  eq(proofs.proof_status, "proved"),
                  gt(proofs.proved_timestamp, sevenDaysAgo),
                  zkvmId ? eq(zkvms.id, zkvmId) : undefined
                )
              )
          ),
          teamId ? eq(clusters.team_id, teamId) : undefined
        ),
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
            cluster_machines: {
              with: {
                machine: true,
              },
            },
          },
        },
      },
    })
  },
  ["getActiveClusters"]
)

export const getClustersByTeamId = async (teamId: string) => {
  const clusters = await db.query.clusters.findMany({
    where: (clusters, { eq }) => eq(clusters.team_id, teamId),
  })

  return clusters
}

export const getActiveClusterCountByZkvmId = cache(async () => {
  const sevenDaysAgo = sql`NOW() - INTERVAL '7 days'`

  const result = await db
    .select({
      zkvm_id: zkvms.id,
      active_clusters: sql<number>`CAST(COUNT(DISTINCT ${clusters.id}) AS int)`,
    })
    .from(zkvms)
    .innerJoin(zkvmVersions, eq(zkvms.id, zkvmVersions.zkvm_id))
    .innerJoin(
      clusterVersions,
      eq(zkvmVersions.id, clusterVersions.zkvm_version_id)
    )
    .innerJoin(clusters, eq(clusterVersions.cluster_id, clusters.id))
    .where(
      exists(
        db
          .select()
          .from(proofs)
          .where(
            and(
              eq(proofs.cluster_version_id, clusterVersions.id),
              eq(proofs.proof_status, "proved"),
              gt(proofs.proved_timestamp, sevenDaysAgo)
            )
          )
      )
    )
    .groupBy(zkvms.id)

  return result
}, ["getActiveClusterCountByZkvmId"])

export const getActiveMachineCount = cache(async () => {
  const sevenDaysAgo = sql`NOW() - INTERVAL '7 days'`

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
              eq(proofs.proof_status, "proved"),
              gt(proofs.proved_timestamp, sevenDaysAgo)
            )
          )
      )
    )

  return machineCount.count
}, ["getActiveMachineCount"])

export const getClustersBenchmarks = cache(async () => {
  const clusters = await db.query.clusters.findMany({
    with: {
      benchmarks: true,
      team: true,
    },
    where: (clusters, { and, exists, notIlike }) =>
      // hide test teams from the provers list
      exists(
        db
          .select()
          .from(teams)
          .where(
            and(eq(teams.id, clusters.team_id), notIlike(teams.name, "%test%"))
          )
      ),
    // order by the clusters that have benchmarks first
    orderBy: (clusters) => [
      desc(
        sql`EXISTS (SELECT 1 FROM cluster_benchmarks WHERE cluster_benchmarks.cluster_id = ${clusters.id})`
      ),
    ],
  })

  return clusters
}, ["getClustersBenchmarks"])
