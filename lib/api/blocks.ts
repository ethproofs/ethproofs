import { eq } from "drizzle-orm"
import { count } from "drizzle-orm"
import { PaginationState } from "@tanstack/react-table"

import { db } from "@/db"
import { blocks, proofs } from "@/db/schema"

export const fetchBlocksPaginated = async (pagination: PaginationState) => {
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
                },
              },
            },
          },
        },
      },
    },
    where: (blocks, { eq, exists }) =>
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

  return {
    rows: blocksRows,
    rowCount: rowCount.count,
  }
}
