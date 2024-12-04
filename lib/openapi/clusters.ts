import { z } from "zod"
import { ZodOpenApiPathsObject } from "zod-openapi"

import { ClusterSchema, createClusterSchema } from "../zod/schemas/cluster"

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
                cluster_id: z.number(),
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
              schema: z.array(ClusterSchema),
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
