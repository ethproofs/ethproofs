import { revalidateTag } from "next/cache"
import { ZodError } from "zod"

import { base64ToHex } from "@/lib/utils"

import { withAuth } from "@/lib/auth/withAuth"
import { fetchBlockData } from "@/lib/blocks"
import { provedProofSchema } from "@/lib/zod/schemas/proof"

// TODO: refactor code to use baseProofHandler and abstract out the logic

export const POST = withAuth(async ({ request, client, user, timestamp }) => {
  const payload = await request.json()

  // TODO: remove when we go to production, this is a temporary log to debug the payload
  console.log("payload", payload)

  if (!user) {
    return new Response("Invalid API key", {
      status: 401,
    })
  }

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

  const { block_number, cluster_id, verifier_id, ...restProofPayload } =
    proofPayload

  // validate block_number exists
  console.log("validating block_number", block_number)
  const block = await client
    .from("blocks")
    .select("block_number")
    .eq("block_number", block_number)
    .single()

  // if block is new (not in db), fetch block data from block explorer and create block record
  if (block.error) {
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

    // create block
    console.log("creating block", block_number)
    const { error } = await client.from("blocks").insert({
      block_number,
      gas_used: Number(blockData.gasUsed),
      transaction_count: blockData.txsCount,
      timestamp: new Date(Number(blockData.timestamp) * 1000).toISOString(),
      hash: blockData.hash,
    })

    if (error) {
      console.error("error creating block", error)
      return new Response("Internal server error", { status: 500 })
    }

    // invalidate blocks cache
    revalidateTag("blocks")
  }

  // get cluster uuid from cluster_id
  const { data: clusterData, error: clusterError } = await client
    .from("clusters")
    .select("id")
    .eq("index", cluster_id)
    .eq("user_id", user.id)
    .single()

  if (clusterError) {
    console.error("error getting cluster", clusterError)
    return new Response("Cluster not found", { status: 404 })
  }

  // create or get program id if it exists
  let programId
  if (verifier_id) {
    const { data: existingProgramData, error: existingProgramError } =
      await client
        .from("programs")
        .select("id")
        .eq("verifier_id", verifier_id)
        .single()

    programId = existingProgramData?.id

    if (existingProgramError) {
      console.info("no existing program")

      const { data: programData, error: programError } = await client
        .from("programs")
        .insert({ verifier_id })
        .select("id")
        .single()

      if (programError) {
        console.error("error creating program", programError)
      }

      programId = programData?.id
    }
  }

  // get proof_id to update or create an existing proof
  let proofId = proofPayload.proof_id
  if (!proofPayload.proof_id) {
    const { data: existingProofData } = await client
      .from("proofs")
      .select("proof_id")
      .eq("block_number", block_number)
      .eq("cluster_id", clusterData.id)
      .eq("user_id", user.id)
      .single()

    proofId = existingProofData?.proof_id
  }

  // add proof
  console.log("adding proof", {
    proof_id: proofId,
    ...restProofPayload,
  })

  const proofHex = base64ToHex(proofPayload.proof)

  const proofResponse = await client
    .from("proofs")
    .upsert(
      {
        ...restProofPayload,
        block_number,
        proof_id: proofId,
        cluster_id: clusterData.id,
        program_id: programId,
        proof_status: "proved",
        proved_timestamp: timestamp,
        size_bytes: Buffer.byteLength(proofHex, "hex"),
        user_id: user.id,
      },
      {
        onConflict: "block_number,cluster_id",
      }
    )
    .select("proof_id")
    .single()

  if (proofResponse.error) {
    console.error("error adding proof", proofResponse.error)
    return new Response("Internal server error", { status: 500 })
  }

  // add proof binary
  const proofBinaryResponse = await client.from("proof_binaries").upsert({
    proof_id: proofResponse.data.proof_id,
    proof_binary: `\\x${proofHex}`,
  })

  if (proofBinaryResponse.error) {
    console.error("error adding proof binary", proofBinaryResponse.error)
    return new Response("Internal server error", { status: 500 })
  }

  // invalidate proofs cache
  revalidateTag("proofs")

  // return the generated proof_id
  return Response.json(proofResponse.data)
})
