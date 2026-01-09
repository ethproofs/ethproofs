import { and, desc, eq, exists, sql } from "drizzle-orm"
import { revalidateTag, unstable_cache as cache } from "next/cache"

import { TAGS } from "@/lib/constants"

import { db } from "@/db"
import {
  clusters,
  clusterVersions,
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
          prover_type: true,
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

      return cluster
    },
    ["cluster", id],
    {
      revalidate: false,
      tags: [`cluster-${id}`],
    }
  )(id)
}

export const getClusters = async (filters?: { teamId?: string }) => {
  const { teamId } = filters ?? {}
  const cacheKey = `clusters-${teamId}`

  return cache(
    async (filters?: { teamId?: string }) => {
      const { teamId } = filters ?? {}

      const whereConditions = []

      if (teamId) {
        whereConditions.push(eq(clusters.team_id, teamId))
      }

      return db.query.clusters.findMany({
        where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
        with: {
          team: true,
          prover_type: true,
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
    },
    [cacheKey],
    {
      revalidate: 60 * 60 * 24, // daily
      tags: [TAGS.CLUSTERS],
    }
  )(filters)
}

export const getActiveClusters = async (filters?: {
  teamId?: string
  zkvmId?: number
}) => {
  const { teamId, zkvmId } = filters ?? {}
  const cacheKey = `active-clusters-${teamId}-${zkvmId}`

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
          prover_type: true,
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

export const getClustersBenchmarks = cache(async () => {
  const clusters = await db.query.clusters.findMany({
    with: {
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
  })

  return clusters
})

export const getZkvmVersions = cache(
  async () => {
    const versions = await db.query.zkvmVersions.findMany({
      with: {
        zkvm: true,
      },
    })

    // Sort by zkVM name first, then by id descending within each zkVM
    return versions.sort((a, b) => {
      const zkvmCompare = a.zkvm.name.localeCompare(b.zkvm.name)
      if (zkvmCompare !== 0) return zkvmCompare

      // Sort by id descending (newest first) within same zkVM
      return b.id - a.id
    })
  },
  ["zkvm-versions"],
  {
    revalidate: 60 * 60 * 24, // daily
    tags: [TAGS.ZKVM_VERSIONS],
  }
)

export const getProverTypes = cache(
  async () => {
    return db.query.proverTypes.findMany({
      orderBy: (proverTypes) => proverTypes.id,
    })
  },
  ["prover-types"],
  {
    revalidate: 60 * 60 * 24, // daily
    tags: ["prover-types"],
  }
)

export const updateClusterMetadata = async (
  clusterId: string,
  data: {
    name?: string
    num_gpus?: number
    hardware_description?: string
    prover_type_id?: number
    is_active?: boolean
  }
) => {
  const updateData: {
    name?: string
    num_gpus?: number
    hardware_description?: string
    prover_type_id?: number
    is_active?: boolean
  } = {}

  if (data.name !== undefined) {
    updateData.name = data.name
  }

  if (data.num_gpus !== undefined) {
    updateData.num_gpus = data.num_gpus
  }

  if (data.hardware_description !== undefined) {
    updateData.hardware_description = data.hardware_description
  }

  if (data.prover_type_id !== undefined) {
    updateData.prover_type_id = data.prover_type_id
  }

  if (data.is_active !== undefined) {
    updateData.is_active = data.is_active
  }

  const [updatedCluster] = await db
    .update(clusters)
    .set(updateData)
    .where(eq(clusters.id, clusterId))
    .returning()

  // Invalidate caches
  revalidateTag(TAGS.CLUSTERS)
  revalidateTag(`cluster-${clusterId}`)

  return updatedCluster
}

export const createClusterVersion = async (
  clusterId: string,
  data: {
    zkvm_version_id: number
    vk_path?: string
  }
) => {
  let newVersion

  await db.transaction(async (tx) => {
    // Get the next version index for this cluster
    const lastVersion = await tx.query.clusterVersions.findFirst({
      where: (cv, { eq }) => eq(cv.cluster_id, clusterId),
      columns: { index: true },
      orderBy: (cv) => desc(cv.index),
    })
    const nextIndex = (lastVersion?.index ?? 0) + 1

    // Deactivate all existing versions for this cluster
    await tx
      .update(clusterVersions)
      .set({ is_active: false })
      .where(eq(clusterVersions.cluster_id, clusterId))

    // Create new version
    const [createdVersion] = await tx
      .insert(clusterVersions)
      .values({
        cluster_id: clusterId,
        index: nextIndex,
        zkvm_version_id: data.zkvm_version_id,
        vk_path: data.vk_path ?? null,
        is_active: true,
      })
      .returning()

    newVersion = createdVersion
  })

  // Invalidate caches
  revalidateTag(TAGS.CLUSTERS)
  revalidateTag(`cluster-${clusterId}`)

  return newVersion
}
