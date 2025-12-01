import { z } from "zod"
import { ZodOpenApiPathsObject } from "zod-openapi"

import {
  activeClusterIdSchema,
  clusterSchema,
  createClusterSchema,
} from "../zod/schemas/cluster"

export const clustersPaths: ZodOpenApiPathsObject = {
  "/clusters": {
    post: {
      tags: ["Clusters"],
      summary: "Create a cluster",
      requestBody: {
        required: true,
        content: {
          "application/json": { schema: createClusterSchema },
        },
      },
      responses: {
        "200": {
          description: "Cluster created",
          content: {
            "application/json": {
              schema: z.object({
                id: z.number(),
              }),
            },
          },
        },
        "400": {
          description: "Invalid request body or cluster configuration",
        },
        "401": {
          description: "Invalid API key",
        },
        "500": {
          description: "Internal server error",
        },
      },
      security: [{ apikey: [] }],
    },
    get: {
      tags: ["Clusters"],
      summary: "List clusters",
      responses: {
        "200": {
          description: "Clusters list",
          content: {
            "application/json": {
              schema: z.array(clusterSchema),
            },
          },
        },
        "401": {
          description: "Invalid API key",
        },
        "500": {
          description: "Internal server error",
        },
      },
      security: [{ apikey: [] }],
    },
  },
  "/clusters/active": {
    get: {
      tags: ["Clusters"],
      summary: "List active clusters for a team",
      parameters: [
        {
          name: "team_id",
          in: "query",
          required: true,
          description: "The UUID of the team",
          schema: {
            type: "string",
            format: "uuid",
          },
          example: "550e8400-e29b-41d4-a716-446655440000",
        },
      ],
      responses: {
        "200": {
          description: "Active cluster IDs list",
          content: {
            "application/json": {
              schema: z.array(activeClusterIdSchema),
            },
          },
        },
        "401": {
          description: "Invalid API key",
        },
        "403": {
          description: "Admin mode required",
        },
        "422": {
          description: "Invalid query parameters",
        },
        "500": {
          description: "Internal server error",
        },
      },
      security: [{ apikey: [] }],
    },
  },
}
