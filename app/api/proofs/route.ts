import { revalidateTag } from "next/cache"
import { formatGwei } from "viem"
import { ZodError } from "zod"

import { proofSchema } from "./proofSchema"

import { withAuth } from "@/lib/auth"
import { fetchBlockData } from "@/lib/blocks"

export const POST = withAuth(async ({ request, client, user }) => {
  const proofPayload = await request.json()

  if (!user) {
    return new Response("Invalid API key", {
      status: 401,
    })
  }

  // validate payload schema
  try {
    proofSchema.parse(proofPayload)
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

  const {
    proof,
    block_number,
    prover_duration,
    proof_status,
    proving_cost,
    proving_cycles,
  } = proofPayload

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
      total_fees: parseInt(formatGwei(blockData.feeTotal)),
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

  // TODO validate prover_machine exists and fetch prover_machine_id

  // get proof to update or create
  const { data: existingProofData } = await client
    .from("proofs")
    .select("proof_id")
    .eq("block_number", block_number)
    // .eq("prover_machine_id", prover_machine_id)
    .eq("user_id", user.id)
    .single()

  // add proof
  console.log("adding proof", proofPayload)
  const proofResponse = await client
    .from("proofs")
    .upsert({
      proof_id: existingProofData?.proof_id,
      block_number,
      proof,
      prover_machine_id: 1, // TODO: fetch prover_machine_id
      prover_duration,
      proving_cost,
      proving_cycles,
      proof_status,
      user_id: user.id,
    })
    .select("proof_id")

  if (proofResponse.error) {
    console.error("error adding proof", proofResponse.error)
    return new Response("Internal server error", { status: 500 })
  }

  // invalidate proofs cache
  revalidateTag("proofs")

  // return the generated proof_id
  return new Response(JSON.stringify(proofResponse.data), { status: 200 })
})
