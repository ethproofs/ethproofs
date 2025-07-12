import { startOfDay } from "date-fns"
import { and, eq, gte, lte, sql } from "drizzle-orm"
import { count } from "drizzle-orm"
import { unstable_cache as cache } from "next/cache"
import { PaginationState } from "@tanstack/react-table"

import { TAGS } from "../constants"

import { db } from "@/db"
import { clusterVersions, proofs, teams } from "@/db/schema"

export const fetchTeamProofsPaginated = async (
  teamId: string,
  pagination: PaginationState
) => {
  const proofsRows = await db.query.proofs.findMany({
    with: {
      block: true,
      cluster_version: {
        with: {
          cluster: true,
          cluster_machines: {
            with: {
              cloud_instance: true,
              machine: true,
            },
          },
        },
      },
    },
    where: (proofs, { eq }) => eq(proofs.team_id, teamId),
    orderBy: (proofs, { desc }) => [desc(proofs.created_at)],
    limit: pagination.pageSize,
    offset: pagination.pageIndex * pagination.pageSize,
  })

  const [rowCount] = await db
    .select({ count: count() })
    .from(proofs)
    .where(eq(proofs.team_id, teamId))

  return {
    rows: proofsRows,
    rowCount: rowCount.count,
  }
}

export const fetchTeamProofsPerStatusCount = async (teamId: string) => {
  const proofsPerStatusCount = await db
    .select({
      proof_status: proofs.proof_status,
      count: sql<number>`cast(count(${proofs.proof_id}) as int)`,
    })
    .from(proofs)
    .where(eq(proofs.team_id, teamId))
    .groupBy(proofs.proof_status)

  return proofsPerStatusCount
}

export const fetchProofsPerStatusCount = async (
  fromDate?: Date,
  toDate?: Date
) => {
  const from = fromDate ? startOfDay(fromDate).toISOString() : undefined
  const to = toDate ? startOfDay(toDate).toISOString() : undefined

  const keyParts = [
    "proofs-per-status-count",
    ...(from ? [from] : []),
    ...(to ? [to] : []),
  ]

  return cache(
    async (from: string | undefined, to: string | undefined) => {
      const proofsPerStatusCount = await db
        .select({
          proof_status: proofs.proof_status,
          count: sql<number>`cast(count(${proofs.proof_id}) as int)`,
        })
        .from(proofs)
        .where(
          and(
            from ? gte(proofs.created_at, from) : undefined,
            to ? lte(proofs.created_at, to) : undefined
          )
        )
        .groupBy(proofs.proof_status)

      return proofsPerStatusCount
    },
    keyParts,
    {
      revalidate: 60 * 60 * 1, // hourly
      tags: [TAGS.PROOFS],
    }
  )(from, to)
}

export const lastProvedProof = async () => {
  const lastProvedProof = await db.query.proofs.findFirst({
    where: (proofs, { eq }) => eq(proofs.proof_status, "proved"),
    orderBy: (proofs, { desc }) => [desc(proofs.created_at)],
  })

  return lastProvedProof
}

export const fetchProvedProofsByClusterId = async (
  clusterId: string,
  { limit = 10 }: { limit?: number } = {}
) => {
  return cache(
    async (clusterId: string) => {
      const lastProvedProof = await db.query.proofs.findMany({
        with: {
          block: true,
          team: true,
          cluster_version: {
            with: {
              cluster: true,
              cluster_machines: {
                with: {
                  cloud_instance: true,
                  machine: true,
                },
              },
            },
          },
        },
        where: (proofs, { eq, and, inArray }) =>
          and(
            eq(proofs.proof_status, "proved"),
            inArray(
              proofs.cluster_version_id,
              db
                .select({ id: clusterVersions.id })
                .from(clusterVersions)
                .where(eq(clusterVersions.cluster_id, clusterId))
            )
          ),
        orderBy: (proofs, { desc }) => [desc(proofs.created_at)],
        limit,
      })

      return lastProvedProof
    },
    ["cluster-proofs", clusterId],
    {
      revalidate: false,
      tags: [`cluster-${clusterId}`],
    }
  )(clusterId)
}

export const fetchProofsFiltered = async ({
  teamSlug,
  blockNumber,
  limit = 100,
  offset = 0,
}: {
  teamSlug?: string
  blockNumber?: number
  limit?: number
  offset?: number
}) => {
  // Build where conditions
  const conditions = []
  
  if (blockNumber) {
    conditions.push(eq(proofs.block_number, blockNumber))
  }

  // First get team ID if team slug is provided
  let teamId: string | null = null
  if (teamSlug) {
    const team = await db.query.teams.findFirst({
      where: (teams, { eq }) => eq(teams.slug, teamSlug)
    })
    if (team) {
      teamId = team.id
      conditions.push(eq(proofs.team_id, teamId))
    } else {
      // Team not found, return empty results
      return {
        rows: [],
        rowCount: 0,
      }
    }
  }

  // Query proofs with all related data
  const proofsRows = await db.query.proofs.findMany({
    with: {
      team: true,
      block: true,
      cluster_version: {
        with: {
          cluster: true,
          zkvm_version: {
            with: {
              zkvm: true,
            },
          },
          cluster_machines: {
            with: {
              cloud_instance: {
                with: {
                  provider: true,
                },
              },
              machine: true,
            },
          },
        },
      },
    },
    where: conditions.length > 0 ? and(...conditions) : undefined,
    orderBy: (proofs, { desc }) => [desc(proofs.created_at)],
    limit: Math.min(limit, 1000),
    offset,
  })

  // Count total for pagination
  const [rowCount] = await db
    .select({ count: count() })
    .from(proofs)
    .where(conditions.length > 0 ? and(...conditions) : undefined)

  return {
    rows: proofsRows,
    rowCount: rowCount.count,
  }
}
