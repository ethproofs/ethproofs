import { z } from "zod"
import { ZodOpenApiPathsObject } from "zod-openapi"

import {
  proofListSchema,
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
    description: "Invalid request",
  },
  "401": {
    description: "Invalid API key",
  },
  "404": {
    description: "Cluster not found",
  },
  "409": {
    description: "Proof already proved",
  },
  "500": {
    description: "Internal server error",
  },
}

export const proofsPaths: ZodOpenApiPathsObject = {
  "/proofs/download/block/{block}": {
    get: {
      tags: ["Proofs"],
      summary: "Download proofs for a block",
      description:
        "Download all proved proofs for a specific block as a ZIP file.",
      parameters: [
        {
          name: "block",
          in: "path",
          description: "The block hash (0x-prefixed 64 hex characters)",
          required: true,
          schema: {
            type: "string",
            pattern: "^0x[a-fA-F0-9]{64}$",
          },
          example:
            "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        },
      ],
      responses: {
        "200": {
          description: "ZIP file containing all proved proofs for the block",
          content: {
            "application/zip": {
              schema: {
                type: "string",
                format: "binary",
              },
            },
          },
        },
        "404": {
          description: "Block not found or no proofs found for the block",
        },
        "500": {
          description: "Internal server error",
        },
      },
    },
  },
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
              schema: proofListSchema,
            },
          },
        },
        "400": {
          description: "Invalid query parameters",
        },
        "422": {
          description: "Validation error",
          content: {
            "application/json": {
              schema: z.array(
                z.object({
                  code: z.string(),
                  message: z.string(),
                  path: z.array(z.union([z.string(), z.number()])),
                })
              ),
            },
          },
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
