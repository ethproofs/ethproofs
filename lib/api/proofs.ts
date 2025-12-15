import { startOfDay } from "date-fns"
import { and, desc, eq, gte, inArray, lte, sql } from "drizzle-orm"
import { count } from "drizzle-orm"
import { unstable_cache as cache } from "next/cache"
import { PaginationState } from "@tanstack/react-table"

import { DEFAULT_FETCH_LIMIT, TAGS } from "../constants"

import { downloadProofBinary } from "./proof-binaries"
import { getTeam } from "./teams"

import { db } from "@/db"
import { proofs } from "@/db/schema"

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
          zkvm_version: {
            with: {
              zkvm: true,
            },
          },
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
  pagination?: PaginationState,
  totalLimit?: number
) => {
  const pageSize = pagination?.pageSize ?? 20
  const pageIndex = pagination?.pageIndex ?? 0
  const offset = pageIndex * pageSize

  // Get the last N proofs then paginate within those
  const maxProofsToFetch = totalLimit ?? DEFAULT_FETCH_LIMIT

  const proofsRows = await db.query.proofs.findMany({
    with: {
      block: true,
      team: true,
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
    where: (proofs, { eq, and }) =>
      and(eq(proofs.proof_status, "proved"), eq(proofs.cluster_id, clusterId)),
    orderBy: (proofs, { desc }) => [desc(proofs.created_at)],
    limit: maxProofsToFetch,
  })

  // Count total proofs matching the criteria (capped at limit)
  const [rowCountResult] = await db
    .select({ count: count() })
    .from(proofs)
    .where(
      and(eq(proofs.proof_status, "proved"), eq(proofs.cluster_id, clusterId))
    )

  const totalCount = rowCountResult.count
  const cappedRowCount = Math.min(totalCount, maxProofsToFetch)

  // Apply pagination on the fetched results
  const paginatedProofs = proofsRows.slice(offset, offset + pageSize)

  return {
    rows: paginatedProofs,
    rowCount: cappedRowCount,
  }
}

export const fetchProofsFiltered = async ({
  block,
  clusterIds,
  limit = DEFAULT_FETCH_LIMIT,
  offset = 0,
}: {
  block?: string
  clusterIds?: string[]
  limit?: number
  offset?: number
}) => {
  const { isHash } = await import("viem")

  // Build where conditions
  const conditions = []

  // Handle block parameter (can be hash or number)
  let blockNumber: number | undefined
  if (block !== undefined) {
    if (isHash(block)) {
      // It's a hash, look it up
      const blockRecord = await db.query.blocks.findFirst({
        where: (blocks, { eq }) => eq(blocks.hash, block),
      })
      if (blockRecord) {
        blockNumber = blockRecord.block_number
      } else {
        // Block hash not found, return empty results
        return {
          rows: [],
          rowCount: 0,
        }
      }
    } else {
      // It's a block number
      blockNumber = parseInt(block, 10)
    }
  }

  if (blockNumber !== undefined) {
    conditions.push(eq(proofs.block_number, blockNumber))
  }

  // Only return proved proofs
  conditions.push(eq(proofs.proof_status, "proved"))

  // Filter by cluster IDs if provided
  if (clusterIds && clusterIds.length > 0) {
    conditions.push(inArray(proofs.cluster_id, clusterIds))
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
    where: and(...conditions),
    orderBy: (proofs, { desc }) => [desc(proofs.created_at)],
    limit: Math.min(limit, 1000),
    offset,
  })

  // Count total for pagination
  const [rowCount] = await db
    .select({ count: count() })
    .from(proofs)
    .where(and(...conditions))

  return {
    rows: proofsRows,
    rowCount: rowCount.count,
  }
}

export const fetchAllProofsForRealtime = async () => {
  // Get the 3 most recent block numbers that have proofs
  const topBlocks = await db
    .selectDistinct({ block_number: proofs.block_number })
    .from(proofs)
    .orderBy((proofs) => desc(proofs.block_number))
    .limit(3)

  if (topBlocks.length === 0) {
    return []
  }

  const blockNumbersToFetch = topBlocks.map((row) => row.block_number)

  // Fetch all proofs for those blocks
  const proofsRows = await db.query.proofs.findMany({
    with: {
      block: true,
      team: true,
      cluster_version: {
        with: {
          cluster: true,
          zkvm_version: {
            with: {
              zkvm: true,
            },
          },
        },
      },
    },
    where: (proofs, { inArray }) =>
      inArray(proofs.block_number, blockNumbersToFetch),
    orderBy: (proofs, { desc }) => [
      desc(proofs.block_number),
      desc(proofs.created_at),
    ],
  })

  return proofsRows
}

interface ProofData {
  proof_id: number
  cluster_id: string
  proof_status: string
  block_number: number
  team_id: string
  cluster_version?: {
    is_active: boolean
    vk_path: string | null
    zkvm_version: {
      zkvm: {
        slug: string
      }
    }
  } | null
}

/**
 * Fetch proof metadata needed for downloading and verifying
 */
export async function getProofData(proofId: string): Promise<ProofData> {
  const proof = await db.query.proofs.findFirst({
    where: eq(proofs.proof_id, parseInt(proofId)),
    columns: {
      proof_id: true,
      cluster_id: true,
      proof_status: true,
      block_number: true,
      team_id: true,
    },
    with: {
      cluster_version: {
        columns: {
          is_active: true,
          vk_path: true,
        },
        with: {
          zkvm_version: {
            with: {
              zkvm: {
                columns: {
                  slug: true,
                },
              },
            },
          },
        },
      },
    },
  })

  if (!proof) {
    throw new Error(`Proof not found: ${proofId}`)
  }

  return proof
}

/**
 * Download proof binary with fallback filename options, returns both binary and filename used
 */
export async function downloadBinaryForProofId(
  proofId: number,
  proofData: ProofData
): Promise<{ arrayBuffer: ArrayBuffer; filename: string }> {
  const team = await getTeam(proofData.team_id)
  const teamSlug = team?.slug ? team.slug : proofData.cluster_id.split("-")[0]

  // Try filenames in order of preference (new format first)
  const filenamesToTry = [
    `${teamSlug}_${proofData.cluster_id}_${proofId}.bin`,
    `${teamSlug}_${proofData.block_number}_${proofId}.bin`,
    ...(team?.name
      ? [`${proofData.block_number}_${team.name}_${proofId}.bin`]
      : []),
  ]

  let blob: Blob | null = null
  let filename = filenamesToTry[0] // Default to new format

  for (const filenameToTry of filenamesToTry) {
    blob = await downloadProofBinary(filenameToTry, { silent: true })
    if (blob) {
      filename = filenameToTry
      break
    }
  }

  if (!blob) {
    throw new Error(
      `Failed to download proof: no binary found for proofId ${proofId}`
    )
  }

  const arrayBuffer = await blob.arrayBuffer()

  return {
    arrayBuffer,
    filename,
  }
}
