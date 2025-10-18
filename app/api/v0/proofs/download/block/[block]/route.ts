import AdmZip from "adm-zip"

import { db } from "@/db"
import { downloadProofBinary } from "@/lib/api/proof-binaries"
import { getTeam } from "@/lib/api/teams"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ block: string }> }
) {
  const { block: blockNumber } = await params

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
        eq(proofs.block_number, Number(blockNumber)),
        eq(proofs.proof_status, "proved")
      ),
  })

  if (!proofRows || !proofRows.length) {
    return new Response("No proofs found", { status: 404 })
  }

  const binaryBuffers: { binaryBuffer: Buffer; filename: string }[] = []

  for (const proofRow of proofRows) {
    const team = await getTeam(proofRow.team_id)

    const {
      id: cluster_id,
      proof_type,
      cycle_type,
    } = proofRow.cluster_version.cluster
    const teamName = team?.name ? team.name : cluster_id.split("-")[0]
    const filenameInStorage = `${proofRow.block_number}_${teamName}_${proofRow.proof_id}.bin`

    const blob = await downloadProofBinary(filenameInStorage)
    if (blob) {
      const arrayBuffer = await blob.arrayBuffer()
      const binaryBuffer = Buffer.from(arrayBuffer)

      const filename = `block_${blockNumber}_${proof_type}_${cycle_type}_${teamName}.bin`
      binaryBuffers.push({ binaryBuffer, filename })
    }
  }

  // Create a zip file from buffers using adm-zip
  const zip = new AdmZip()
  binaryBuffers.forEach(({ binaryBuffer, filename }) => {
    zip.addFile(filename, binaryBuffer)
  })

  const zipBuffer = zip.toBuffer()

  return new Response(new Uint8Array(zipBuffer), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="block_${blockNumber}_proofs.zip"`,
    },
  })
}
