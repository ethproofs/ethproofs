import { db } from "@/db"
import { getTeam } from "@/lib/api/teams"
import { downloadVerificationKey } from "@/lib/api/verification-keys"
import { withAuthAndRateLimit } from "@/lib/middleware/with-rate-limit"

// Rate limit: 30 requests per 60 seconds per API key
export const GET = withAuthAndRateLimit(
  async (_request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params

    const proofRow = await db.query.proofs.findFirst({
      columns: {
        cluster_id: true,
        team_id: true,
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
    const filename = `${teamSlug}_${proofRow.cluster_id}.bin`

    const blob = await downloadVerificationKey(filename)

    if (!blob) {
      return new Response("No vk binary found", { status: 404 })
    }

    const arrayBuffer = await blob.arrayBuffer()

    return new Response(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  },
  { requests: 30, window: 60 }
)
