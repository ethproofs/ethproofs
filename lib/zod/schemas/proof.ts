import z from ".."

const baseProofSchema = z.object({
  // If not provided, the proof is going to be searched by block_number and cluster_id
  proof_id: z
    .number()
    .optional()
    .describe(
      "Unique identifier for the proof. If no proof_id is provided, the system will attempt to find an existing proof for the block_number and cluster_id"
    ),
  block_number: z.number().min(0, "block_number must be a positive number"),
  cluster_id: z.number(),
})

const queuedProofSchema = baseProofSchema.extend({
  proof_status: z.literal("queued"),
})

const provingProofSchema = baseProofSchema.extend({
  proof_status: z.literal("proving"),
})

const provedProofSchema = baseProofSchema.extend({
  proof_status: z.literal("proved"),
  proving_time: z
    .number()
    .positive("proving_time must be a positive number")
    .describe("Milliseconds taken to generate the proof"),
  proving_cost: z
    .number()
    .positive("proving_cost must be a positive number")
    .describe("Cost of generating the proof (in USD)"),
  proving_cycles: z
    .number()
    .int()
    .positive("proving_cycles must be a positive integer"),
  proof: z.string().min(1, "proof is required for 'proved' status"),
})

export const createProofSchema = z.discriminatedUnion("proof_status", [
  queuedProofSchema,
  provingProofSchema,
  provedProofSchema,
])
