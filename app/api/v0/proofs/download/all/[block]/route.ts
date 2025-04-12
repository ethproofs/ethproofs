import AdmZip from "adm-zip"

import { db } from "@/db"
import { downloadProofBinary } from "@/lib/api/proof_binaries"
import { getTeam } from "@/lib/api/teams"

export async function GET(
  _request: Request,
  { params }: { params: { block: string } }
) {
  const { block } = params

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
        eq(proofs.block_number, Number(block)),
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
    const filename = `block_${block}_${proof_type}_${cycle_type}_${teamName}.txt`

    const blob = await downloadProofBinary(filename)
    if (blob) {
      const arrayBuffer = await blob.arrayBuffer()
      const binaryBuffer = Buffer.from(arrayBuffer)

      binaryBuffers.push({ binaryBuffer, filename })
    }
  }

  // Create a zip file from buffers using adm-zip
  const zip = new AdmZip()
  binaryBuffers.forEach(({ binaryBuffer, filename }) => {
    zip.addFile(filename, binaryBuffer)
  })

  const zipBuffer = zip.toBuffer()

  return new Response(zipBuffer, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="block_${block}_all_proofs.zip"`,
    },
  })
}
