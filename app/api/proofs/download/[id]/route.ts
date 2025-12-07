import { NextRequest } from "next/server"

import { db } from "@/db"
import { downloadBinaryForProofId } from "@/lib/api/proofs"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    // Verify proof exists and is proved
    const proofRow = await db.query.proofs.findFirst({
      where: (proofs, { and, eq }) =>
        and(eq(proofs.proof_id, Number(id)), eq(proofs.proof_status, "proved")),
      columns: {
        cluster_id: true,
        block_number: true,
        team_id: true,
      },
    })

    if (!proofRow) {
      return new Response("No proof found", { status: 404 })
    }

    const { arrayBuffer, filename } = await downloadBinaryForProofId(
      Number(id),
      {
        proof_id: Number(id),
        cluster_id: proofRow.cluster_id,
        proof_status: "proved",
        block_number: proofRow.block_number,
        team_id: proofRow.team_id,
      }
    )

    return new Response(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No proof binary found"
    return new Response(message, { status: 404 })
  }
}
