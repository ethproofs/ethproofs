import { z } from "zod"
import { ZodOpenApiPathsObject } from "zod-openapi"

import { createProofSchema } from "../zod/schemas/proof"

export const proofsPaths: ZodOpenApiPathsObject = {
  "/proofs": {
    post: {
      tags: ["Proofs"],
      summary: "Submit a new proof or update an existing one",
      requestBody: {
        required: true,
        description:
          "The request body schema varies based on the `proof_status` field.",
        content: {
          "application/json": {
            schema: createProofSchema,
            examples: {
              queued: {
                summary: "Queued proof",
                value: createProofSchema.parse({
                  proof_status: "queued",
                  block_number: 123456,
                  cluster_id: 1,
                }),
              },
              proving: {
                summary: "Proving proof",
                value: createProofSchema.parse({
                  proof_status: "proving",
                  block_number: 123456,
                  cluster_id: 1,
                }),
              },
              proved: {
                summary: "Proved proof",
                value: createProofSchema.parse({
                  proof_status: "proved",
                  block_number: 123456,
                  cluster_id: 1,
                  proof: "...",
                  proof_latency: 100,
                  proving_cost: 540,
                  proving_cycles: 10000,
                }),
              },
            },
          },
        },
      },
      responses: {
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
          description: "Machine not found",
        },
        "500": {
          description: "Internal server error or block not found",
        },
      },
      security: [{ apikey: [] }],
    },
  },
}
