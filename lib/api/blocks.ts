import { PaginationState } from "@tanstack/react-table"

import { db } from "@/db"
import { blocks } from "@/db/schema"

export const fetchBlocksPaginated = async (pagination: PaginationState) => {
  const blocksRows = await db.query.blocks.findMany({
    with: {
      proofs: {
        with: {
          cluster: {
            with: {
              cluster_configuration: {
                with: {
                  aws_instance_pricing: true,
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

  return {
    rows: blocksRows,
    rowCount: blocksRows[0].rowCount,
  }
}
