import { count, eq } from "drizzle-orm"
import { unstable_cache as cache } from "next/cache"
import { PaginationState } from "@tanstack/react-table"

import { fetchBlockData } from "../blocks"
import { isUndefined } from "../utils"

import { db } from "@/db"
import {
  blocks,
  clusters,
  clusterVersions,
  proofs,
  proverTypes,
} from "@/db/schema"

export type MachineType = "single" | "multi" | "all"

export const findOrCreateBlock = async (blockNumber: number) => {
  const foundBlock = await db.query.blocks.findFirst({
    columns: {
      block_number: true,
    },
    where: (blocks, { eq }) => eq(blocks.block_number, blockNumber),
  })

  if (isUndefined(foundBlock)) {
    console.log("Creating block:", blockNumber)

    try {
      const [block] = await db
        .insert(blocks)
        .values({ block_number: blockNumber })
        .onConflictDoUpdate({
          target: [blocks.block_number],
          set: { block_number: blockNumber },
        })
        .returning({ block_number: blocks.block_number })

      return block.block_number
    } catch (error) {
      throw new Error(`[DB] Error creating block: ${error}`)
    }
  }

  return foundBlock.block_number
}

export const updateBlock = async (blockNumber: number) => {
  console.log("Fetching block data:", blockNumber)
  let blockData
  try {
    blockData = await fetchBlockData(blockNumber)
  } catch (error) {
    throw new Error(`[RPC] Upstream error: ${error}`)
  }

  console.log("Updating block:", blockNumber)

  const dataToInsert = {
    block_number: blockNumber,
    gas_used: Number(blockData.gasUsed),
    transaction_count: blockData.txsCount,
    timestamp: new Date(Number(blockData.timestamp) * 1000).toISOString(),
    hash: blockData.hash,
  }

  try {
    const [block] = await db
      .insert(blocks)
      .values(dataToInsert)
      .onConflictDoUpdate({
        target: [blocks.block_number],
        set: { ...dataToInsert },
      })
      .returning({ block_number: blocks.block_number })

    return block.block_number
  } catch (error) {
    throw new Error(`[DB] Error updating block: ${error}`)
  }
}

export const fetchBlocksPaginated = async (
  pagination: PaginationState,
  machineType: MachineType = "all"
) => {
  const blocksRows = await db.query.blocks.findMany({
    with: {
      proofs: {
        with: {
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
          gpu_price_index: true,
        },
        where:
          machineType === "all"
            ? undefined
            : (proofs, { exists, eq, and }) =>
                exists(
                  db
                    .select()
                    .from(clusterVersions)
                    .innerJoin(
                      clusters,
                      eq(clusterVersions.cluster_id, clusters.id)
                    )
                    .innerJoin(
                      proverTypes,
                      eq(clusters.prover_type_id, proverTypes.id)
                    )
                    .where(
                      and(
                        eq(clusterVersions.id, proofs.cluster_version_id),
                        eq(
                          proverTypes.gpu_configuration,
                          machineType === "multi" ? "multi-gpu" : "single-gpu"
                        )
                      )
                    )
                ),
      },
    },
    where: (blocks, { exists, eq, and }) =>
      machineType === "all"
        ? exists(
            db
              .select()
              .from(proofs)
              .where(eq(proofs.block_number, blocks.block_number))
          )
        : exists(
            db
              .select()
              .from(proofs)
              .innerJoin(
                clusterVersions,
                eq(proofs.cluster_version_id, clusterVersions.id)
              )
              .innerJoin(clusters, eq(clusterVersions.cluster_id, clusters.id))
              .innerJoin(
                proverTypes,
                eq(clusters.prover_type_id, proverTypes.id)
              )
              .where(
                and(
                  eq(proofs.block_number, blocks.block_number),
                  eq(
                    proverTypes.gpu_configuration,
                    machineType === "multi" ? "multi-gpu" : "single-gpu"
                  )
                )
              )
          ),
    orderBy: (blocks, { desc }) => [desc(blocks.block_number)],
    limit: pagination.pageSize,
    offset: pagination.pageIndex * pagination.pageSize,
  })

  const [rowCount] = await db
    .select({ count: count() })
    .from(blocks)
    .innerJoin(proofs, eq(blocks.block_number, proofs.block_number))
    .innerJoin(
      clusterVersions,
      eq(proofs.cluster_version_id, clusterVersions.id)
    )
    .innerJoin(clusters, eq(clusterVersions.cluster_id, clusters.id))
    .innerJoin(proverTypes, eq(clusters.prover_type_id, proverTypes.id))
    .where(
      machineType === "all"
        ? undefined
        : eq(
            proverTypes.gpu_configuration,
            machineType === "multi" ? "multi-gpu" : "single-gpu"
          )
    )

  return {
    rows: blocksRows,
    rowCount: rowCount.count,
  }
}

export const fetchBlock = async ({
  blockNumber,
  hash,
}: {
  blockNumber?: number
  hash?: string
}) => {
  const cacheTag = blockNumber?.toString() || hash || ""

  return cache(
    async ({ blockNumber, hash }: { blockNumber?: number; hash?: string }) => {
      const block = await db.query.blocks.findFirst({
        with: {
          proofs: {
            with: {
              team: true,
              cluster_version: {
                with: {
                  cluster: {
                    with: {
                      prover_type: true,
                    },
                  },
                  zkvm_version: {
                    with: {
                      zkvm: true,
                    },
                  },
                },
              },
              gpu_price_index: true,
            },
          },
        },
        where: (blocks, { eq, or }) =>
          or(
            blockNumber ? eq(blocks.block_number, blockNumber) : undefined,
            hash ? eq(blocks.hash, hash) : undefined
          ),
      })

      return block
    },
    ["block", blockNumber?.toString() || hash || ""],
    {
      revalidate: 60 * 60 * 24, // daily
      tags: [`block-${cacheTag}`],
    }
  )({ blockNumber, hash })
}

export const fetchBlocks = cache(
  async (machineType: MachineType = "all", limit: number = 10) => {
    const blocksRows = await db.query.blocks.findMany({
      with: {
        proofs: {
          with: {
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
            gpu_price_index: true,
          },
          // Filter proofs by cluster type
          where:
            machineType === "all"
              ? undefined
              : (proofs, { exists, eq, and }) =>
                  exists(
                    db
                      .select()
                      .from(clusterVersions)
                      .innerJoin(
                        clusters,
                        eq(clusterVersions.cluster_id, clusters.id)
                      )
                      .innerJoin(
                        proverTypes,
                        eq(clusters.prover_type_id, proverTypes.id)
                      )
                      .where(
                        and(
                          eq(clusterVersions.id, proofs.cluster_version_id),
                          eq(
                            proverTypes.gpu_configuration,
                            machineType === "multi" ? "multi-gpu" : "single-gpu"
                          )
                        )
                      )
                  ),
        },
      },
      where: (blocks, { exists, eq, and }) =>
        machineType === "all"
          ? exists(
              db
                .select()
                .from(proofs)
                .where(eq(proofs.block_number, blocks.block_number))
            )
          : exists(
              db
                .select()
                .from(proofs)
                .innerJoin(
                  clusterVersions,
                  eq(proofs.cluster_version_id, clusterVersions.id)
                )
                .innerJoin(
                  clusters,
                  eq(clusterVersions.cluster_id, clusters.id)
                )
                .innerJoin(
                  proverTypes,
                  eq(clusters.prover_type_id, proverTypes.id)
                )
                .where(
                  and(
                    eq(proofs.block_number, blocks.block_number),
                    eq(
                      proverTypes.gpu_configuration,
                      machineType === "multi" ? "multi-gpu" : "single-gpu"
                    )
                  )
                )
            ),
      orderBy: (blocks, { desc }) => [desc(blocks.block_number)],
      limit,
    })

    return blocksRows
  },
  ["blocks-top-list"],
  {
    revalidate: 60, // every minute
    tags: ["blocks"],
  }
)
