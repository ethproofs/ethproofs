import { eq, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { ZodError } from "zod"

import { db } from "@/db"
import { blocks, programs, proofs } from "@/db/schema"
import { uploadProofBinary } from "@/lib/api/proof_binaries"
import { isStorageQuotaExceeded } from "@/lib/api/storage"
import { getTeam } from "@/lib/api/teams"
import { fetchBlockData } from "@/lib/blocks"
import { withAuth } from "@/lib/middleware/with-auth"
import { provedProofSchema } from "@/lib/zod/schemas/proof"
// TODO: refactor code to use baseProofHandler and abstract out the logic

export const POST = withAuth(async ({ request, user, timestamp }) => {
  const payload = await request.json()

  // TODO: remove when we go to production, this is a temporary log to debug the payload
  console.log("payload", payload)

  // validate payload schema
  let proofPayload
  try {
    proofPayload = provedProofSchema.parse(payload)
  } catch (error) {
    console.error("proof payload invalid", error)
    if (error instanceof ZodError) {
      return new Response(`Invalid payload: ${error.message}`, {
        status: 400,
      })
    }

    return new Response("Invalid payload", {
      status: 400,
    })
  }

  const { block_number, cluster_id, verifier_id, proof, ...restProofPayload } =
    proofPayload

  // validate block_number exists
  console.log("validating block_number", block_number)
  const block = await db.query.blocks.findFirst({
    columns: {
      block_number: true,
    },
    where: (blocks, { eq }) => eq(blocks.block_number, block_number),
  })

  // if block is new (not in db), fetch block data from block explorer and create block record
  if (!block) {
    console.log("block not found, fetching block data", block_number)
    let blockData
    try {
      blockData = await fetchBlockData(block_number)
    } catch (error) {
      console.error("error fetching block data", error)
      return new Response("Block not found", {
        status: 500,
      })
    }

    try {
      // create block
      console.log("creating block", block_number)
      await db.insert(blocks).values({
        block_number,
        gas_used: Number(blockData.gasUsed),
        transaction_count: blockData.txsCount,
        timestamp: new Date(Number(blockData.timestamp) * 1000).toISOString(),
        hash: blockData.hash,
      })
    } catch (error) {
      console.error("error creating block", error)
      return new Response("Internal server error", { status: 500 })
    }
  }

  // get cluster uuid from cluster_id
  const cluster = await db.query.clusters.findFirst({
    columns: {
      id: true,
    },
    where: (clusters, { and, eq }) =>
      and(eq(clusters.index, cluster_id), eq(clusters.team_id, user.id)),
  })

  if (!cluster) {
    console.error("cluster not found", cluster_id)
    return new Response("Cluster not found", { status: 404 })
  }

  // create or get program id if it exists
  let programId: number | undefined
  if (verifier_id) {
    const existingProgram = await db.query.programs.findFirst({
      columns: {
        id: true,
      },
      where: (programs, { eq }) => eq(programs.verifier_id, verifier_id),
    })

    programId = existingProgram?.id

    if (!existingProgram) {
      console.info("no program found, creating program")

      try {
        const [program] = await db
          .insert(programs)
          .values({
            verifier_id,
          })
          .returning()

        programId = program?.id
      } catch (error) {
        console.error("error creating program", error)
      }
    }
  }

  const binaryBuffer = Buffer.from(proof, "base64")

  // Check storage quota
  const storageQuotaExceeded = await isStorageQuotaExceeded(
    user.id,
    binaryBuffer.byteLength
  )

  if (storageQuotaExceeded) {
    console.log(
      `[Storage Quota] team ${user.id} has reached quota. Skipping binary upload.`
    )
  }

  // add proof
  const dataToInsert = {
    ...restProofPayload,
    block_number,
    cluster_id: cluster.id,
    program_id: programId,
    proof_status: "proved",
    proved_timestamp: timestamp,
    size_bytes: binaryBuffer.byteLength,
    team_id: user.id,
  }

  console.log("adding proved proof", dataToInsert)

  try {
    const newProof = await db.transaction(async (tx) => {
      const [newProof] = await tx
        .insert(proofs)
        .values(dataToInsert)
        .onConflictDoUpdate({
          target: [proofs.block_number, proofs.cluster_id],
          set: {
            ...dataToInsert,
          },
        })
        .returning({ proof_id: proofs.proof_id })

      if (!storageQuotaExceeded) {
        const team = await getTeam(user.id)
        const teamName = team?.name ? team.name : cluster.id.split("-")[0]
        const filename = `${block_number}_${teamName}_${newProof.proof_id}.txt`
        await uploadProofBinary(filename, binaryBuffer)
      }

      return newProof
    })

    // invalidate home page cache
    revalidatePath("/")

    // return the generated proof_id
    return Response.json(newProof)
  } catch (error) {
    console.error("error adding proof", error)
    return new Response("Internal server error", { status: 500 })
  }
})
