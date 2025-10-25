import { and, desc, eq, exists, gt, sql, sum } from "drizzle-orm"
import { unstable_cache as cache } from "next/cache"

import { TAGS } from "@/lib/constants"

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
  return cache(
    async (id: string) => {
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
    },
    ["cluster", id],
    {
      revalidate: false,
      tags: [`cluster-${id}`],
    }
  )(id)
}

export const getActiveClusters = async (filters?: {
  teamId?: string
  zkvmId?: number
}) => {
  const cacheKey = `active-clusters-${filters?.teamId}-${filters?.zkvmId}`

  return cache(
    async (filters?: { teamId?: string; zkvmId?: number }) => {
      const { teamId, zkvmId } = filters ?? {}

      const existsConditions = [
        eq(clusterVersions.cluster_id, clusters.id),
        eq(clusters.is_active, true),
      ]

      if (zkvmId) {
        existsConditions.push(eq(zkvms.id, zkvmId))
      }

      const whereConditions = [
        exists(
          db
            .select()
            .from(clusterVersions)
            .innerJoin(
              zkvmVersions,
              eq(clusterVersions.zkvm_version_id, zkvmVersions.id)
            )
            .innerJoin(zkvms, eq(zkvmVersions.zkvm_id, zkvms.id))
            .where(and(...existsConditions))
        ),
      ]

      if (teamId) {
        whereConditions.push(eq(clusters.team_id, teamId))
      }

      return db.query.clusters.findMany({
        where: and(...whereConditions),
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
    [cacheKey],
    {
      revalidate: 60 * 60 * 24, // daily
      tags: [TAGS.CLUSTERS],
    }
  )(filters)
}

export const getActiveClusterCountByZkvmId = cache(
  async () => {
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
      .where(eq(clusters.is_active, true))
      .groupBy(zkvms.id)

    return result
  },
  ["active-clusters-by-zkvm-id"],
  {
    revalidate: 60 * 60 * 24, // daily
    tags: [TAGS.CLUSTERS],
  }
)

export const getActiveMachineCount = cache(
  async () => {
    const [machineCount] = await db
      .select({ count: sum(clusterMachines.machine_count) })
      .from(clusterMachines)
      .innerJoin(
        clusterVersions,
        eq(clusterMachines.cluster_version_id, clusterVersions.id)
      )
      .innerJoin(clusters, eq(clusterVersions.cluster_id, clusters.id))
      .where(eq(clusters.is_active, true))

    return machineCount.count
  },
  ["active-machine-count"],
  {
    revalidate: 60 * 60 * 24, // daily
    tags: [TAGS.CLUSTERS],
  }
)

export const getClustersBenchmarks = cache(async () => {
  const clusters = await db.query.clusters.findMany({
    with: {
      benchmarks: true,
      team: true,
    },
    where: (clusters, { and, exists, notIlike }) =>
      and(
        eq(clusters.is_active, true),
        // hide test teams from the provers list
        exists(
          db
            .select()
            .from(teams)
            .where(
              and(
                eq(teams.id, clusters.team_id),
                notIlike(teams.name, "%test%")
              )
            )
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
})
