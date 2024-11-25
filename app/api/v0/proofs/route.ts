import { revalidateTag } from "next/cache"
import { formatGwei } from "viem"
import { ZodError } from "zod"

import { proofSchema } from "./proofSchema"

import { withAuth } from "@/lib/auth"
import { fetchBlockData } from "@/lib/blocks"

export const POST = withAuth(async ({ request, client, user, timestamp }) => {
  const payload = await request.json()

  if (!user) {
    return new Response("Invalid API key", {
      status: 401,
    })
  }

  // validate payload schema
  let proofPayload
  try {
    proofPayload = proofSchema.parse(payload)
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

  const { block_number, proof_status, machine_id } = proofPayload

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

  // get machine uuid from machine_id
  const { data: proverMachineData, error: proverMachineError } = await client
    .from("prover_machines")
    .select("id")
    .eq("machine_id", machine_id)
    .eq("user_id", user.id)
    .single()

  if (proverMachineError) {
    console.error("error getting prover machine", proverMachineError)
    return new Response("Machine not found", { status: 404 })
  }

  // get proof_id to update or create an existing proof
  let proofId
  if (!proofPayload.proof_id) {
    const { data: existingProofData } = await client
      .from("proofs")
      .select("proof_id")
      .eq("block_number", block_number)
      .eq("prover_machine_id", proverMachineData.id)
      .eq("user_id", user.id)
      .single()

    proofId = existingProofData?.proof_id
  }

  // add proof
  console.log("adding proof", proofPayload)
  const timestampField = {
    queued: "queued_timestamp",
    proving: "proving_timestamp",
    proved: "proved_timestamp",
  }[proof_status]

  const proofResponse = await client
    .from("proofs")
    .upsert({
      ...proofPayload,
      proof_id: proofId,
      block_number,
      machine_id: proverMachineData.id,
      proof_status,
      user_id: user.id,
      [timestampField]: timestamp,
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
