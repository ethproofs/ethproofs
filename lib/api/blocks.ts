import { count, eq } from "drizzle-orm"
import { unstable_cache as cache } from "next/cache"
import { PaginationState } from "@tanstack/react-table"

import { fetchBlockData } from "../blocks"
import { logger } from "../logger"
import { blockRpcDuration, blocksProcessed } from "../otel-metrics"
import { isUndefined } from "../utils"

import { db } from "@/db"
import { blocks, clusters, clusterVersions, proofs } from "@/db/schema"

export type MachineType = "single" | "multi" | "all"

export const findOrCreateBlock = async (blockNumber: number) => {
  const foundBlock = await db.query.blocks.findFirst({
    columns: {
      block_number: true,
    },
    where: (blocks, { eq }) => eq(blocks.block_number, blockNumber),
  })

  if (isUndefined(foundBlock)) {
    logger.info("Creating new block", { block_number: blockNumber })

    try {
      const [block] = await db
        .insert(blocks)
        .values({ block_number: blockNumber })
        .onConflictDoUpdate({
          target: [blocks.block_number],
          set: { block_number: blockNumber },
        })
        .returning({ block_number: blocks.block_number })

      blocksProcessed.add(1, { operation: "created" })

      return block.block_number
    } catch (error) {
      logger.error("Failed to create block", error, { block_number: blockNumber })
      throw new Error(`[DB] Error creating block: ${error}`)
    }
  }

  return foundBlock.block_number
}

export const updateBlock = async (blockNumber: number) => {
  logger.debug("Fetching block data from RPC", { block_number: blockNumber })

  const startTime = Date.now()
  let blockData

  try {
    blockData = await fetchBlockData(blockNumber)
  } catch (error) {
    const duration = Date.now() - startTime
    blockRpcDuration.record(duration, {
      rpc: "primary",
      success: "false",
    })
    logger.error("RPC error fetching block data", error, { block_number: blockNumber })
    throw new Error(`[RPC] Upstream error: ${error}`)
  }

  const rpcDuration = Date.now() - startTime
  blockRpcDuration.record(rpcDuration, {
    rpc: "primary",
    success: "true",
  })

  logger.debug("Updating block in database", { block_number: blockNumber })

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

    blocksProcessed.add(1, { operation: "updated" })

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
              cluster_machines: {
                with: {
                  cloud_instance: true,
                  machine: true,
                },
              },
            },
          },
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
                    .where(
                      and(
                        eq(clusterVersions.id, proofs.cluster_version_id),
                        eq(clusters.is_multi_machine, machineType === "multi")
                      )
                    )
                ),
      },
    },
    where: (blocks, { exists }) =>
      exists(
        db
          .select()
          .from(proofs)
          .where(eq(proofs.block_number, blocks.block_number))
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
    .where(
      machineType === "all"
        ? undefined
        : eq(clusters.is_multi_machine, machineType === "multi")
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
                  cluster: true,
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
                  zkvm_version: {
                    with: {
                      zkvm: true,
                    },
                  },
                },
              },
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
                cluster_machines: {
                  with: {
                    cloud_instance: true,
                    machine: true,
                  },
                },
              },
            },
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
                      .where(
                        and(
                          eq(clusterVersions.id, proofs.cluster_version_id),
                          eq(clusters.is_multi_machine, machineType === "multi")
                        )
                      )
                  ),
        },
      },
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
