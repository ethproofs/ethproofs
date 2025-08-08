import { db } from "@/db"
import { getTeam } from "@/lib/api/teams"
import { downloadVerificationKey } from "@/lib/api/verification-keys"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const proofRow = await db.query.proofs.findFirst({
    columns: {
      block_number: true,
      team_id: true,
    },
    with: {
      cluster_version: {
        with: {
          cluster: {
            columns: {
              id: true,
            },
          },
        },
      },
    },
    where: (proofs, { and, eq }) =>
      and(eq(proofs.proof_id, Number(id)), eq(proofs.proof_status, "proved")),
  })

  if (!proofRow) {
    return new Response("No proof found", { status: 404 })
  }

  const team = await getTeam(proofRow.team_id)
  const teamSlug = team?.slug
    ? team.slug
    : team?.name.toLowerCase() || "unknown"
  const filename = `${teamSlug}-vk.bin`

  const blob = await downloadVerificationKey(filename)

  if (!blob) {
    return new Response("No vk binary found", { status: 404 })
  }

  const arrayBuffer = await blob.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  return new Response(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  })
}
