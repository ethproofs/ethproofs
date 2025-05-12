import { revalidatePath } from "next/cache"
import { ZodError } from "zod"

import { db } from "@/db"
import { blocks, proofs } from "@/db/schema"
import { fetchBlockData } from "@/lib/blocks"
import { withAuth } from "@/lib/middleware/with-auth"
import { queuedProofSchema } from "@/lib/zod/schemas/proof"

// TODO: refactor code to use baseProofHandler and abstract out the logic

export const POST = withAuth(async ({ request, user, timestamp }) => {
  const payload = await request.json()

  // TODO: remove when we go to production, this is a temporary log to debug the payload
  console.log("payload", payload)

  // validate payload schema
  let proofPayload
  try {
    proofPayload = queuedProofSchema.parse(payload)
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

  const { block_number, cluster_id } = proofPayload

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
      await db
        .insert(blocks)
        .values({
          block_number,
          gas_used: Number(blockData.gasUsed),
          transaction_count: blockData.txsCount,
          timestamp: new Date(Number(blockData.timestamp) * 1000).toISOString(),
          hash: blockData.hash,
        })
        .onConflictDoNothing()
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

  // get the last cluster_version_id from cluster_id
  const clusterVersion = await db.query.clusterVersions.findFirst({
    columns: {
      id: true,
    },
    where: (clusterVersions, { eq }) =>
      eq(clusterVersions.cluster_id, cluster.id),
    orderBy: (clusterVersions, { desc }) => [desc(clusterVersions.created_at)],
  })

  if (!clusterVersion) {
    console.error("cluster version not found", cluster_id)
    return new Response("Cluster version not found", { status: 404 })
  }

  // add proof
  const dataToInsert = {
    ...proofPayload,
    block_number,
    cluster_version_id: clusterVersion.id,
    proof_status: "queued",
    queued_timestamp: timestamp,
    team_id: user.id,
  }

  console.log("adding queued proof", dataToInsert)

  try {
    const [proof] = await db
      .insert(proofs)
      .values(dataToInsert)
      .onConflictDoUpdate({
        target: [proofs.block_number, proofs.cluster_version_id],
        set: {
          proof_status: "queued",
          queued_timestamp: timestamp,
        },
      })
      .returning({ proof_id: proofs.proof_id })

    // invalidate home page cache
    revalidatePath("/")

    // return the generated proof_id
    return Response.json(proof)
  } catch (error) {
    console.error("error adding proof", error)
    return new Response("Internal server error", { status: 500 })
  }
})
