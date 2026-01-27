import { z } from "zod"
import { ZodOpenApiPathsObject } from "zod-openapi"

import {
  clusterSchema,
  createClusterSchema,
  updateClusterApiSchema,
} from "../zod/schemas/cluster"

export const clustersPaths: ZodOpenApiPathsObject = {
  "/clusters/{id}": {
    patch: {
      tags: ["Clusters"],
      summary: "Update a cluster",
      description:
        "Update cluster metadata and/or create a new cluster version. Changing zkvm_version_id or vk_path creates a new cluster version.",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "integer" },
          description: "Cluster ID (index)",
          example: 1,
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": { schema: updateClusterApiSchema },
        },
      },
      responses: {
        "200": {
          description: "Cluster updated successfully",
          content: {
            "application/json": {
              schema: z.object({
                success: z.boolean(),
              }),
            },
          },
        },
        "400": {
          description:
            "Invalid request body, no fields to update, or invalid configuration",
        },
        "401": {
          description: "Invalid API key",
        },
        "404": {
          description: "Cluster not found",
        },
        "409": {
          description:
            "Conflict - active cluster of this prover type already exists",
        },
        "500": {
          description: "Internal server error",
        },
      },
      security: [{ apikey: [] }],
    },
  },
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
}
