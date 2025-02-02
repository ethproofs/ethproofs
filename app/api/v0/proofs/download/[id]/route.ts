import { db } from "@/db"

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params

  const proofRow = await db.query.proofs.findFirst({
    columns: {
      block_number: true,
      cluster_id: true,
      team_id: true,
    },
    with: {
      proof_binary: true,
    },
    where: (proofs, { eq }) => eq(proofs.proof_id, Number(id)),
  })

  if (!proofRow || !proofRow.proof_binary) {
    return new Response("No proof found", { status: 404 })
  }

  const team = await db.query.teams.findFirst({
    columns: {
      name: true,
    },
    where: (teams, { eq }) => eq(teams.id, proofRow.team_id),
  })

  const teamName = team?.name ? team.name : proofRow.cluster_id.split("-")[0]
  const filename = `${proofRow.block_number}_${teamName}_${id}.txt`

  const binaryBuffer = Buffer.from(
    proofRow.proof_binary.proof_binary.slice(2),
    "hex"
  )
  const blob = new Blob([binaryBuffer], {
    type: "application/octet-stream",
  })

  return new Response(blob, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  })
}
