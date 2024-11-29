import { z } from "zod"
import { ZodOpenApiPathsObject } from "zod-openapi"

import { createMachineSchema, MachineSchema } from "../zod/schemas/machine"

export const machinesPaths: ZodOpenApiPathsObject = {
  "/machines": {
    post: {
      tags: ["machines"],
      summary: "Create a machine",
      requestBody: {
        required: true,
        content: {
          "application/json": { schema: createMachineSchema },
        },
      },
      responses: {
        "200": {
          description: "Machine created",
          content: {
            "application/json": {
              schema: z.object({
                machine_id: z.number(),
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
    get: {
      tags: ["machines"],
      summary: "List machines",
      responses: {
        "200": {
          description: "Machines list",
          content: {
            "application/json": {
              schema: z.array(MachineSchema),
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
