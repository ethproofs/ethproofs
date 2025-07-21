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
  "/proofs": {
    get: {
      tags: ["Proofs"],
      summary: "List proofs",
      description: "Retrieve a filtered and paginated list of proofs.",
      parameters: [
        {
          name: "team",
          in: "query",
          description: "Filter by team slug",
          required: false,
          schema: {
            type: "string",
          },
        },
        {
          name: "block",
          in: "query",
          description: "Filter by specific block number",
          required: false,
          schema: {
            type: "number",
          },
        },
        {
          name: "limit",
          in: "query",
          description: "Number of proofs to return (default: 100, max: 1000)",
          required: false,
          schema: {
            type: "integer",
            default: 100,
            minimum: 1,
            maximum: 1000,
          },
        },
        {
          name: "offset",
          in: "query",
          description: "Number of proofs to skip for pagination (default: 0)",
          required: false,
          schema: {
            type: "integer",
            default: 0,
            minimum: 0,
          },
        },
      ],
      responses: {
        "200": {
          description: "List of proofs retrieved successfully",
          content: {
            "application/json": {
              schema: z.object({
                proofs: z.array(
                  z.object({
                    proof_id: z.number(),
                    block_number: z.number(),
                    status: z.enum(["queued", "proving", "proved"]),
                    proving_time_s: z.number().nullable(),
                    cost_usd: z.number().nullable(),
                    cycles: z.number().nullable(),
                    team: z
                      .object({
                        slug: z.string(),
                        name: z.string(),
                      })
                      .nullable(),
                    cluster: z
                      .object({
                        id: z.string(),
                        name: z.string(),
                        is_multi_machine: z.boolean(),
                      })
                      .nullable(),
                    zkvm: z
                      .object({
                        name: z.string(),
                        version: z.string(),
                      })
                      .nullable(),
                    timestamps: z.object({
                      created: z.string(),
                      queued: z.string().nullable(),
                      proving: z.string().nullable(),
                      proved: z.string().nullable(),
                    }),
                  })
                ),
                total: z.number(),
                limit: z.number(),
                offset: z.number(),
              }),
            },
          },
        },
        "400": {
          description: "Invalid query parameters",
        },
        "500": {
          description: "Internal server error",
        },
      },
    },
  },
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
              proof: "YmluYXJ5X3Byb29mX2RhdGE=",
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
