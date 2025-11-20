import { db } from "@/db"
import { downloadProofBinary } from "@/lib/api/proof-binaries"
import { getTeam } from "@/lib/api/teams"
import { withRateLimit } from "@/lib/middleware/with-rate-limit"

// Rate limit: 100 requests per 60 seconds per IP
export const GET = withRateLimit(
  async (
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
  ) => {
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
      : proofRow.cluster_version.cluster.id.split("-")[0]
    const clusterId = proofRow.cluster_version.cluster.id

    // TODO:TEAM - run a script to migrate all proofs to the new filename format
    // Try filenames in order of preference (new format first)
    const filenamesToTry = [
      // NEW format: teamSlug_clusterId_proofId
      `${teamSlug}_${clusterId}_${id}.bin`,
      // OLD format: teamSlug_blockNumber_proofId
      `${teamSlug}_${proofRow.block_number}_${id}.bin`,
      // LEGACY format: blockNumber_teamName_proofId
      ...(team?.name
        ? [`${proofRow.block_number}_${team.name}_${id}.bin`]
        : []),
    ]

    let blob: Blob | null = null
    let filename = filenamesToTry[0] // Default to new format for response

    for (const filenameToTry of filenamesToTry) {
      blob = await downloadProofBinary(filenameToTry, { silent: true })
      if (blob) {
        filename = filenameToTry
        break
      }
    }

    if (!blob) {
      return new Response("No proof binary found", { status: 404 })
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
  { requests: 100, window: 60 }
)
