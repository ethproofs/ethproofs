import { z } from "zod"
import { ZodOpenApiPathsObject } from "zod-openapi"

import {
  CloudInstancesQuerySchema,
  CloudInstancesSchema,
} from "../zod/schemas/cloud-instance"

export const cloudInstancesPaths: ZodOpenApiPathsObject = {
  "/cloud-instances": {
    get: {
      tags: ["Cloud instances"],
      summary: "List cloud instances",
      description:
        "Returns a list of available cloud instances across different providers. Filter results by provider using the query parameter. See [Cloud Instances](/docs/cloud-instances) for a visual table view and more details.",
      requestParams: {
        query: CloudInstancesQuerySchema,
      },
      responses: {
        "200": {
          description: "Cloud instances",
          content: {
            "application/json": {
              schema: z.array(CloudInstancesSchema),
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
