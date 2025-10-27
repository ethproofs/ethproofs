import z from ".."

import { blockSchema } from "./block"
import { clusterVersionWithRelationsSchema } from "./cluster-version"
import { teamSchema } from "./team"

const baseProofSchema = z.object({
  block_number: z.number().min(0, "block_number must be a positive number"),
  cluster_id: z.number(),
})

export const queuedProofSchema = baseProofSchema.extend({})

export const provingProofSchema = baseProofSchema.extend({})

export const provedProofSchema = baseProofSchema.extend({
  proving_time: z
    .number()
    .positive("proving_time must be a positive number")
    .describe(
      "Time in milliseconds taken to generate the proof including witness generation. It excludes time taken for data fetching and any latency to submit the proof."
    ),
  proving_cycles: z
    .number()
    .int()
    .positive("proving_cycles must be a positive integer")
    .optional()
    .describe("Number of cycles taken to generate the proof."),
  proof: z
    .string()
    // Temporarily disable proof validation to test if its giving maximum call stack error
    //   .base64()
    .describe("Proof in base64 format"),
  verifier_id: z.string().optional().describe("vkey/image-id"),
})

export const proofSchema = baseProofSchema.extend({
  proof_id: z.number().int(),
  proof_status: z.enum(["queued", "proving", "proved"]),
  proving_cycles: z.number().int().optional(),
  team_id: z.string().uuid(),
  created_at: z.string(),
  proved_timestamp: z.string().optional(),
  proving_timestamp: z.string().optional(),
  queued_timestamp: z.string().optional(),
  proving_time: z.number().int().optional(),
  program_id: z.number().int().optional(),
  size_bytes: z.number().int().optional(),
  team: teamSchema.optional(),
  block: blockSchema.optional(),
  cluster_version: clusterVersionWithRelationsSchema.optional(),
})

export const proofListSchema = z.object({
  proofs: z.array(proofSchema),
  total_count: z.number().int(),
  limit: z.number().int(),
  offset: z.number().int(),
})
