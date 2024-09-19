import { z } from "zod"

import { withAuth } from "@/lib/auth"

const proofSchema = z.object({
  team: z.string(),
  proof: z.string(),
  block_number: z.number(),
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
    team,
    proof,
    block_number,
    prover_machine,
    prover_duration,
    proving_cost,
    proving_cycles,
  } = proofPayload

  // TODO validate block_number exists
  // TODO validate prover_machine exists and fetch prover_machine_id

  // add proof
  // TODO: modify once we define the proof schema, should `proof_status` be sent by the prover?
  const proofReponse = await client.from("proofs").insert({
    block_number,
    proof,
    prover_machine_id: 1, // TODO: fetch prover_machine_id
    prover_duration,
    proving_cost,
    proving_cycles,
    proof_status: "proved", // TODO: change once we define the proof schema
    user_id: user.id,
  })

  if (proofReponse.error) {
    console.error("error", proofReponse.error)
    return new Response("Internal server error", { status: 500 })
  }

  return new Response("Proof submitted", { status: 200 })
})
