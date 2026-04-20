import AdmZip from "adm-zip"

import { db } from "@/db"
import { downloadProofBinary } from "@/lib/api/proof-binaries"
import { getTeam } from "@/lib/api/teams"
import { withRateLimit } from "@/lib/middleware/with-rate-limit"

export const GET = withRateLimit(
  async (_request: Request, params: { params: Promise<{ block: string }> }) => {
    const { block: blockHash } = await params.params

    const block = await db.query.blocks.findFirst({
      columns: {
        block_number: true,
        hash: true,
      },
      where: (blocks, { eq }) => eq(blocks.hash, blockHash),
    })

    if (!block) {
      return new Response("Block not found", { status: 404 })
    }

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
          eq(proofs.block_number, block.block_number),
          eq(proofs.proof_status, "proved")
        ),
    })

    if (!proofRows || !proofRows.length) {
      return new Response("No proofs found", { status: 404 })
    }

    const downloadResults = await Promise.all(
      proofRows.map(async (proofRow) => {
        const team = await getTeam(proofRow.team_id)
        const { id: clusterId } = proofRow.cluster_version.cluster
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
        "Content-Disposition": `attachment; filename="${block.hash || block.block_number}_proofs.zip"`,
      },
    })
  },
  { requests: 10, window: 60 }
)
