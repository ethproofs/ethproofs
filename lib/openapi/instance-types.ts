import { z } from "zod"
import { ZodOpenApiPathsObject } from "zod-openapi"

import {
  InstanceTypesQuerySchema,
  InstanceTypesSchema,
} from "../zod/schemas/instance-types"

export const instanceTypesPaths: ZodOpenApiPathsObject = {
  "/instance-types": {
    get: {
      tags: ["Instance types"],
      summary: "List instance types",
      requestParams: {
        query: InstanceTypesQuerySchema,
      },
      responses: {
        "200": {
          description: "Instance types",
          content: {
            "application/json": {
              schema: z.array(InstanceTypesSchema),
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
}
