import { z } from "zod"
import { ZodOpenApiPathsObject } from "zod-openapi"

export const blocksPaths: ZodOpenApiPathsObject = {
  "/blocks/{block}": {
    get: {
      tags: ["Blocks"],
      summary: "Get block details",
      description: "Retrieve metadata for a specific block.",
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
                timestamp: z.string(),
                gas_used: z.number(),
                transaction_count: z.number(),
                hash: z.string(),
                created_at: z.string(),
              }),
              example: {
                block_number: 12345,
                timestamp: "2025-01-15T12:00:00Z",
                gas_used: 15000000,
                transaction_count: 250,
                hash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
                created_at: "2025-01-15T12:00:00Z",
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