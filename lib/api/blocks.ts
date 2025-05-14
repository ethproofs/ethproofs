import { count, eq } from "drizzle-orm"
import { unstable_cache as cache } from "next/cache"
import { PaginationState } from "@tanstack/react-table"

import { db } from "@/db"
import { blocks, clusters, clusterVersions, proofs } from "@/db/schema"

export type MachineType = "single" | "multi" | "all"

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

export const fetchBlock = cache(
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
                    cloud_instance: true,
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
  }
)

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
