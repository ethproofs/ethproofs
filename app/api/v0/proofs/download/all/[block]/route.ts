import AdmZip from "adm-zip"

import { db } from "@/db"

export async function GET(
  _request: Request,
  { params }: { params: { block: string } }
) {
  const { block } = params

  const proofRows = await db.query.proofs.findMany({
    columns: {
      block_number: true,
      cluster_id: true,
      team_id: true,
    },
    with: {
      proof_binary: true,
      cluster: {
        columns: {
          proof_type: true,
          cycle_type: true,
        },
      },
    },
    where: (proofs, { eq }) => eq(proofs.block_number, Number(block)),
  })

  if (!proofRows || !proofRows.length) {
    return new Response("No proofs found", { status: 404 })
  }

  const binaryBuffers: { binaryBuffer: Buffer; filename: string }[] = []

  for (const proofRow of proofRows) {
    const team = await db.query.teams.findFirst({
      columns: {
        name: true,
      },
      where: (teams, { eq }) => eq(teams.id, proofRow.team_id),
    })

    const { proof_type, cycle_type } = proofRow.cluster
    const teamName = team?.name ? team.name : proofRow.cluster_id.split("-")[0]
    const filename = `block_${block}_${proof_type}_${cycle_type}_${teamName}.txt`

    const binaryBuffer = Buffer.from(
      proofRow.proof_binary.proof_binary.slice(2),
      "hex"
    )

    binaryBuffers.push({ binaryBuffer, filename })
  }

  console.log(`Adding ${binaryBuffers.length} files to the zip`)

  // Create a zip file from buffers using adm-zip
  const zip = new AdmZip()
  binaryBuffers.forEach(({ binaryBuffer, filename }) => {
    console.log(`Adding file: ${filename}`)
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
