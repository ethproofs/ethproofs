import { db } from "@/db"

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params

  const proofRow = await db.query.proofs.findFirst({
    columns: {
      proof: true,
      block_number: true,
      cluster_id: true,
      user_id: true,
    },
    where: (proofs, { eq }) => eq(proofs.proof_id, Number(id)),
  })

  if (!proofRow || !proofRow.proof) {
    return new Response("No proof found", { status: 404 })
  }

  const team = await db.query.teams.findFirst({
    columns: {
      team_name: true,
    },
    where: (teams, { eq }) => eq(teams.user_id, proofRow.user_id),
  })

  const teamName = team?.team_name
    ? team.team_name
    : proofRow.cluster_id.split("-")[0]
  const filename = `${proofRow.block_number}_${teamName}_${id}.bin`

  const binaryBuffer = Buffer.from(proofRow.proof.slice(2), "hex")
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
