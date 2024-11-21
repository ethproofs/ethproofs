import { z } from "zod"

const baseProofSchema = z.object({
  block_number: z.number().min(0, "block_number must be a positive number"),
  prover_machine_id: z.number().optional(), // TODO: make required once we have the machine endpoint
})

const queuedProofSchema = baseProofSchema.extend({
  proof_status: z.literal("queued"),
})

const provingProofSchema = baseProofSchema.extend({
  proof_status: z.literal("proving"),
})

const provedProofSchema = baseProofSchema.extend({
  proof_status: z.literal("proved"),
  proving_cost: z.number().positive("proving_cost must be a positive number"),
  prover_duration: z
    .number()
    .positive("prover_duration must be a positive number"),
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
