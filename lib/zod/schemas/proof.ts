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

export const queuedProofSchema = baseProofSchema.extend({})

export const provingProofSchema = baseProofSchema.extend({})

export const provedProofSchema = baseProofSchema.extend({
  proof: z.string().min(1, "proof is required for 'proved' status"),
  proving_time: z
    .number()
    .positive("proving_time must be a positive number")
    .describe("Milliseconds taken to generate the proof"),
  proving_cycles: z
    .number()
    .int()
    .positive("proving_cycles must be a positive integer"),
  program_id: z.string().optional().describe("vkey/image-id"),
})
