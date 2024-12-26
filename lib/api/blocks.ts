import { PaginationState } from "@tanstack/react-table"

import { tmp_renameClusterConfiguration } from "../clusters"

import { db } from "@/db"
import { blocks } from "@/db/schema"

export const fetchBlocksPaginated = async (pagination: PaginationState) => {
  const blocksRows = await db.query.blocks.findMany({
    with: {
      proofs: {
        with: {
          cluster: {
            with: {
              cc: {
                with: {
                  aip: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: (blocks, { desc }) => [desc(blocks.block_number)],
    limit: pagination.pageSize,
    offset: pagination.pageIndex * pagination.pageSize,
    extras: {
      rowCount: db.$count(blocks).as("count"),
    },
  })

  const renamedBlocks = blocksRows.map((block) => ({
    ...block,
    proofs: block.proofs.map((proof) => ({
      ...proof,
      cluster: tmp_renameClusterConfiguration(proof.cluster),
    })),
  }))

  return {
    rows: renamedBlocks,
    rowCount: blocksRows[0].rowCount,
  }
}
