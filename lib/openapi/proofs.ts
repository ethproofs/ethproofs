import { z } from "zod"
import { ZodOpenApiPathsObject } from "zod-openapi"

import {
  provedProofSchema,
  provingProofSchema,
  queuedProofSchema,
} from "../zod/schemas/proof"

const commonResponses = {
  "200": {
    description: "Proof submitted",
    content: {
      "application/json": {
        schema: z.object({
          proof_id: z.number(),
        }),
      },
    },
  },
  "400": {
    description: "Invalid request body",
  },
  "401": {
    description: "Invalid API key",
  },
  "404": {
    description: "Cluster not found",
  },
  "500": {
    description: "Internal server error or block not found",
  },
}

export const proofsPaths: ZodOpenApiPathsObject = {
  "/proofs/queued": {
    post: {
      tags: ["Proofs"],
      summary: "Queued proof",
      description:
        "The prover indicates they'll prove a block, but they haven't started proving yet.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: queuedProofSchema,
            example: queuedProofSchema.parse({
              block_number: 123456,
              cluster_id: 1,
            }),
          },
        },
      },
      responses: {
        ...commonResponses,
      },
      security: [{ apikey: [] }],
    },
  },
  "/proofs/proving": {
    post: {
      tags: ["Proofs"],
      summary: "Proving proof",
      description: "The prover indicates they've started proving a block.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: provingProofSchema,
            example: provingProofSchema.parse({
              block_number: 123456,
              cluster_id: 1,
            }),
          },
        },
      },
      responses: {
        ...commonResponses,
      },
      security: [{ apikey: [] }],
    },
  },
  "/proofs/proved": {
    post: {
      tags: ["Proofs"],
      summary: "Proved proof",
      description: "The prover indicates they've completed proving a block.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: provedProofSchema,
            example: provedProofSchema.parse({
              block_number: 123456,
              cluster_id: 1,
              proof: "...",
              proving_time: 1000,
              proving_cost: 540,
              proving_cycles: 10000,
              verifier_id: "...",
            }),
          },
        },
      },
      responses: {
        ...commonResponses,
      },
      security: [{ apikey: [] }],
    },
  },
}
