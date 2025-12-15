import { db } from "@/db"
import { getTeam } from "@/lib/api/teams"
import { downloadVerificationKey } from "@/lib/api/verification-keys"
import { withAuthAndRateLimit } from "@/lib/middleware/with-rate-limit"

export const GET = withAuthAndRateLimit(
  async ({ apiKey }, { params }: { params: Promise<{ id: string }> }) => {
    // Restrict to admin mode
    if (apiKey?.mode !== "admin") {
      return new Response(
        "Forbidden: admin mode required for downloading verification keys",
        { status: 403 }
      )
    }

    const { id } = await params

    const proofRow = await db.query.proofs.findFirst({
      columns: {
        cluster_id: true,
        team_id: true,
        cluster_version_id: true,
      },
      where: (proofs, { and, eq }) =>
        and(eq(proofs.proof_id, Number(id)), eq(proofs.proof_status, "proved")),
      with: {
        cluster_version: {
          columns: {
            index: true,
          },
        },
      },
    })

    if (!proofRow) {
      return new Response("No proof found", { status: 404 })
    }

    const team = await getTeam(proofRow.team_id)
    const teamSlug = team?.slug
      ? team.slug
      : team?.name.toLowerCase() || "unknown"

    // Try new filename format with version index first
    let blob: Blob | null = null
    let filename = ""

    if (proofRow.cluster_version?.index !== undefined) {
      const newFilename = `${teamSlug}_${proofRow.cluster_id}_${proofRow.cluster_version.index}.bin`
      blob = await downloadVerificationKey(newFilename)
      filename = newFilename
    }

    // Fall back to legacy filename without index
    if (!blob) {
      const legacyFilename = `${teamSlug}_${proofRow.cluster_id}.bin`
      blob = await downloadVerificationKey(legacyFilename)
      filename = legacyFilename
    }

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
