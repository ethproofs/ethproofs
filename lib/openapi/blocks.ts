import { z } from "zod"
import { ZodOpenApiPathsObject } from "zod-openapi"

export const blocksPaths: ZodOpenApiPathsObject = {
  "/blocks/{block}": {
    get: {
      tags: ["Blocks"],
      summary: "Get block details",
      description: "Retrieve detailed information about a specific block including prover performance data.",
      parameters: [
        {
          name: "block",
          in: "path",
          description: "The block number to retrieve",
          required: true,
          schema: {
            type: "string",
          },
          example: "12345",
        },
      ],
      responses: {
        "200": {
          description: "Block details retrieved successfully",
          content: {
            "application/json": {
              schema: z.object({
                block_number: z.number(),
                prover_performance: z.record(
                  z.string(),
                  z.array(
                    z.object({
                      proof_id: z.number(),
                      proof_time_s: z.number().nullable(),
                      cost_usd: z.number().nullable(),
                      cycles: z.number().nullable(),
                      status: z.enum(["queued", "proving", "proved"]),
                      created_at: z.string(),
                    })
                  )
                ),
              }),
              example: {
                block_number: 12345,
                prover_performance: {
                  "team-slug": [
                    {
                      proof_id: 1001,
                      proof_time_s: 123.45,
                      cost_usd: 10.50,
                      cycles: 1000000,
                      status: "proved",
                      created_at: "2025-01-15T12:00:00Z",
                    },
                    {
                      proof_id: 1002,
                      proof_time_s: 125.30,
                      cost_usd: 10.75,
                      cycles: 1050000,
                      status: "proved",
                      created_at: "2025-01-15T12:05:00Z",
                    },
                  ],
                },
              },
            },
          },
        },
        "400": {
          description: "Invalid block number",
        },
        "404": {
          description: "Block not found",
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
} 