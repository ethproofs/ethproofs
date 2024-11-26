import { z } from "zod"

const baseProofSchema = z.object({
  // If not provided, the proof is going to be searched by block_number and prover_machine_id
  proof_id: z.number().optional(),
  block_number: z.number().min(0, "block_number must be a positive number"),
  prover_machine_id: z.number(),
})

const queuedProofSchema = baseProofSchema.extend({
  proof_status: z.literal("queued"),
})

const provingProofSchema = baseProofSchema.extend({
  proof_status: z.literal("proving"),
})

const provedProofSchema = baseProofSchema.extend({
  proof_status: z.literal("proved"),
  proof_latency: z.number().positive("proof_latency must be a positive number"),
  proving_cost: z.number().positive("proving_cost must be a positive number"),
  proving_cycles: z
    .number()
    .int()
    .positive("proving_cycles must be a positive integer"),
  proof: z.string().min(1, "proof is required for 'proved' status"),
})

export const proofSchema = z.discriminatedUnion("proof_status", [
  queuedProofSchema,
  provingProofSchema,
  provedProofSchema,
])
