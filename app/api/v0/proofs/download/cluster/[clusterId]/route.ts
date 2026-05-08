import AdmZip from "adm-zip"

import { db } from "@/db"
import { downloadProofBinary } from "@/lib/api/proof-binaries"
import { getTeam } from "@/lib/api/teams"
import { withRateLimit } from "@/lib/middleware/with-rate-limit"

const DEFAULT_LIMIT = 25
const MAX_LIMIT = 100

export const GET = withRateLimit(
  async (
    request: Request,
    params: { params: Promise<{ clusterId: string }> }
  ) => {
    const { clusterId } = await params.params
    const url = new URL(request.url)
    const requestedLimit = Number(url.searchParams.get("limit"))
    const limit =
      isNaN(requestedLimit) || requestedLimit < 1
        ? DEFAULT_LIMIT
        : Math.min(requestedLimit, MAX_LIMIT)

    const proofRows = await db.query.proofs.findMany({
      columns: {
        proof_id: true,
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
      where: (proofs, { eq, and }) =>
        and(
          eq(proofs.cluster_id, clusterId),
          eq(proofs.proof_status, "proved")
        ),
      orderBy: (proofs, { desc }) => [desc(proofs.created_at)],
      limit,
    })

    if (!proofRows.length) {
      return new Response("No proofs found", { status: 404 })
    }

    const downloadResults = await Promise.all(
      proofRows.map(async (proofRow) => {
        const team = await getTeam(proofRow.team_id)
        const teamSlug = team?.slug ? team.slug : clusterId.split("-")[0]
        const filename = `${teamSlug}_${clusterId}_${proofRow.proof_id}.bin`

        const blob = await downloadProofBinary(filename, { silent: true })
        if (!blob) return null

        const arrayBuffer = await blob.arrayBuffer()
        return { binaryBuffer: Buffer.from(arrayBuffer), filename }
      })
    )

    const zip = new AdmZip()
    for (const result of downloadResults) {
      if (result) {
        zip.addFile(result.filename, result.binaryBuffer)
      }
    }

    const zipBuffer = zip.toBuffer()
    const arrayBuffer = new Uint8Array(zipBuffer).buffer

    return new Response(arrayBuffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${clusterId}_recent_proofs.zip"`,
      },
    })
  },
  { requests: 10, window: 60 }
)
