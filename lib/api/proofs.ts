import { eq } from "drizzle-orm"
import { count } from "drizzle-orm"
import { PaginationState } from "@tanstack/react-table"

import { tmp_renameClusterConfiguration } from "../clusters"

import { db } from "@/db"
import { proofs } from "@/db/schema"

export const fetchTeamProofsPaginated = async (
  teamId: string,
  pagination: PaginationState
) => {
  const proofsRows = await db.query.proofs.findMany({
    with: {
      block: true,
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
    where: (proofs, { eq }) => eq(proofs.team_id, teamId),
    orderBy: (proofs, { desc }) => [desc(proofs.created_at)],
    limit: pagination.pageSize,
    offset: pagination.pageIndex * pagination.pageSize,
  })

  const [rowCount] = await db
    .select({ count: count() })
    .from(proofs)
    .where(eq(proofs.team_id, teamId))

  const renamedProofs = proofsRows.map((proof) => ({
    ...proof,
    cluster: tmp_renameClusterConfiguration(proof.cluster),
  }))

  return {
    rows: renamedProofs,
    rowCount: rowCount.count,
  }
}
