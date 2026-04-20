import { db } from "@/db"
import { getProofBinaryUrl } from "@/lib/api/proof-binaries"
import { getTeam } from "@/lib/api/teams"
import { withAuthAndRateLimit } from "@/lib/middleware/with-rate-limit"

export const GET = withAuthAndRateLimit(
  async (_request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params
    const proofId = Number(id)

    try {
      const proofRow = await db.query.proofs.findFirst({
        where: (proofs, { and, eq }) =>
          and(eq(proofs.proof_id, proofId), eq(proofs.proof_status, "proved")),
        columns: {
          cluster_id: true,
          team_id: true,
        },
      })

      if (!proofRow) {
        return new Response("No proof found", { status: 404 })
      }

      const team = await getTeam(proofRow.team_id)
      const teamSlug = team?.slug
        ? team.slug
        : proofRow.cluster_id.split("-")[0]

      const filename = `${teamSlug}_${proofRow.cluster_id}_${proofId}.bin`
      const publicUrl = getProofBinaryUrl(filename)

      return Response.redirect(publicUrl, 302)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No proof binary found"
      return new Response(message, { status: 404 })
    }
  },
  { requests: 30, window: 60 }
)
