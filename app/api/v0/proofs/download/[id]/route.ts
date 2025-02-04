import { db } from "@/db"
import { getProofBinary } from "@/lib/api/proof_binaries"
import { getTeam } from "@/lib/api/teams"

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
    where: (proofs, { and, eq }) =>
      and(eq(proofs.proof_id, Number(id)), eq(proofs.proof_status, "proved")),
  })

  if (!proofRow) {
    return new Response("No proof found", { status: 404 })
  }

  const team = await getTeam(proofRow.team_id)

  const teamName = team?.name ? team.name : proofRow.cluster_id.split("-")[0]
  const filename = `${proofRow.block_number}_${teamName}_${id}.txt`

  // if proof_binary field in db is not found, look for it in the bucket
  if (!proofRow.proof_binary) {
    const data = await getProofBinary(filename)

    if (!data) {
      return new Response("No proof binary found", { status: 404 })
    }

    console.log("data", data)
    // redirect to the public url
    return Response.redirect(data.publicUrl)
  }

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
