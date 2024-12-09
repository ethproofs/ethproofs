import { z } from "zod"
import { ZodOpenApiPathsObject } from "zod-openapi"

import { singleMachineSchema } from "../zod/schemas/cluster"

export const singleMachinePaths: ZodOpenApiPathsObject = {
  "/single-machine": {
    post: {
      tags: ["Single machine"],
      summary: "Create a single machine",
      requestBody: {
        required: true,
        content: {
          "application/json": { schema: singleMachineSchema },
        },
      },
      responses: {
        "200": {
          description: "Single machine created",
          content: {
            "application/json": {
              schema: z.object({
                id: z.number(),
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
        "500": {
          description: "Internal server error",
        },
      },
      security: [{ apikey: [] }],
    },
  },
}
