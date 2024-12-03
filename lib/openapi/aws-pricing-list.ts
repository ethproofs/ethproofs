import { z } from "zod"
import { ZodOpenApiPathsObject } from "zod-openapi"

import { AwsInstancePricingSchema } from "../zod/schemas/aws-instance-pricing"

export const awsPricingListPaths: ZodOpenApiPathsObject = {
  "/aws_pricing_list": {
    get: {
      tags: ["Aws pricing list"],
      summary: "List aws pricing list",
      responses: {
        "200": {
          description: "Aws pricing list",
          content: {
            "application/json": {
              schema: z.array(AwsInstancePricingSchema),
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
