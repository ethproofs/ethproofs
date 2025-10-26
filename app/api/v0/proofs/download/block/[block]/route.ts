import AdmZip from "adm-zip"

import { db } from "@/db"
import { downloadProofBinary } from "@/lib/api/proof-binaries"
import { getTeam } from "@/lib/api/teams"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ block: string }> }
) {
  const { block: blockHash } = await params

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
      block_number: true,
      proof_id: true,
      team_id: true,
    },
    with: {
      cluster_version: {
        with: {
          cluster: {
            columns: {
              id: true,
              proof_type: true,
              cycle_type: true,
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

  const binaryBuffers: { binaryBuffer: Buffer; filename: string }[] = []

  for (const proofRow of proofRows) {
    const team = await getTeam(proofRow.team_id)

    const { id: cluster_id } = proofRow.cluster_version.cluster
    const teamSlug = team?.slug ? team.slug : cluster_id.split("-")[0]

    // TODO:TEAM - run a script to migrate all proofs to the new filename format
    // Try filenames in order of preference (new format first)
    const filenamesToTry = [
      // NEW format: teamSlug_clusterId_proofId
      `${teamSlug}_${cluster_id}_${proofRow.proof_id}.bin`,
      // OLD format: teamSlug_blockNumber_proofId
      `${teamSlug}_${proofRow.block_number}_${proofRow.proof_id}.bin`,
      // LEGACY format: blockNumber_teamName_proofId
      ...(team?.name
        ? [`${proofRow.block_number}_${team.name}_${proofRow.proof_id}.bin`]
        : []),
    ]

    let blob: Blob | null = null

    for (const filenameToTry of filenamesToTry) {
      blob = await downloadProofBinary(filenameToTry, { silent: true })
      if (blob) {
        break
      }
    }

    if (blob) {
      const arrayBuffer = await blob.arrayBuffer()
      const binaryBuffer = Buffer.from(arrayBuffer)

      const filename = `${teamSlug}_${cluster_id}_${proofRow.proof_id}.bin`
      binaryBuffers.push({ binaryBuffer, filename })
    }
  }

  const zip = new AdmZip()
  binaryBuffers.forEach(({ binaryBuffer, filename }) => {
    zip.addFile(filename, binaryBuffer)
  })

  const zipBuffer = zip.toBuffer()
  const arrayBuffer = new Uint8Array(zipBuffer).buffer

  return new Response(arrayBuffer, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${block.hash || block.block_number}_proofs.zip"`,
    },
  })
}
