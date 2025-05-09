import { and, eq, gte, lte, sql } from "drizzle-orm"
import { count } from "drizzle-orm"
import { PaginationState } from "@tanstack/react-table"

import { db } from "@/db"
import { clusterVersions, proofs } from "@/db/schema"

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

export const fetchProofsPerStatusCount = async (from?: Date, to?: Date) => {
  const proofsPerStatusCount = await db
    .select({
      proof_status: proofs.proof_status,
      count: sql<number>`cast(count(${proofs.proof_id}) as int)`,
    })
    .from(proofs)
    .where(
      and(
        from ? gte(proofs.created_at, from.toISOString()) : undefined,
        to ? lte(proofs.created_at, to.toISOString()) : undefined
      )
    )
    .groupBy(proofs.proof_status)

  return proofsPerStatusCount
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
  const lastProvedProof = await db.query.proofs.findMany({
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
}
