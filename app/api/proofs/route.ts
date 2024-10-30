import { z } from "zod"
import { formatGwei } from "viem"

import { withAuth } from "@/lib/auth"
import { fetchBlockData } from "@/lib/blocks"

const proofSchema = z.object({
  block_number: z.number(),
  proof: z.string(),
  proof_status: z.enum(["proved", "proving", "queued"]),
  prover_machine: z.number(),
  prover_duration: z.number(),
  proving_cost: z.number(),
  proving_cycles: z.number(),
})

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
    return new Response("Invalid payload", {
      status: 400,
    })
  }

  const {
    proof,
    block_number,
    prover_machine,
    prover_duration,
    proof_status,
    proving_cost,
    proving_cycles,
  } = proofPayload

  // validate block_number exists
  const block = await client
    .from("blocks")
    .select("block_number")
    .eq("block_number", block_number)
    .single()

  // if block is new (not in db), fetch block data from block explorer and create block record
  if (block.error) {
    let blockData
    try {
      blockData = await fetchBlockData(block_number)

      console.log("blockData", blockData)
    } catch (error) {
      console.error("error", error)
      return new Response("Block not found", {
        status: 500,
      })
    }

    // create block
    const { error } = await client.from("blocks").insert({
      block_number,
      total_fees: parseInt(formatGwei(blockData.feeTotal)),
      gas_used: Number(blockData.gasUsed),
      transaction_count: blockData.txsCount,
      timestamp: new Date(Number(blockData.timestamp) * 1000).toISOString(),
    })

    if (error) {
      console.error("error", error)
      return new Response("Internal server error", { status: 500 })
    }
  }

  // TODO validate prover_machine exists and fetch prover_machine_id

  // add proof
  const proofResponse = await client.from("proofs").insert({
    block_number,
    proof,
    prover_machine_id: 1, // TODO: fetch prover_machine_id
    prover_duration,
    proving_cost,
    proving_cycles,
    proof_status,
    user_id: user.id,
  })

  if (proofResponse.error) {
    console.error("error", proofResponse.error)
    return new Response("Internal server error", { status: 500 })
  }

  return new Response("Proof submitted", { status: 200 })
})
