import { z } from "zod"
import { ZodOpenApiPathsObject } from "zod-openapi"

export const cspBenchmarksPaths: ZodOpenApiPathsObject = {
  "/csp-benchmarks/upload": {
    post: {
      tags: ["CSP benchmarks"],
      summary: "Upload CSP benchmarks",
      description: "Upload a CSP benchmarks JSON file to storage.",
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              properties: {
                file: {
                  type: "string",
                  format: "binary",
                  description: "The JSON file containing CSP benchmarks data",
                },
                filename: {
                  type: "string",
                  description:
                    "The filename to use for storage (without .json extension)",
                  example: "collected-benchmarks-2024-01",
                },
              },
              required: ["file", "filename"],
            },
          },
        },
      },
      responses: {
        "200": {
          description: "CSP benchmarks uploaded successfully",
          content: {
            "application/json": {
              schema: z.object({
                message: z.string(),
                path: z.string(),
              }),
              example: {
                message: "CSP benchmarks uploaded successfully",
                path: "collected-benchmarks-2024-01.json",
              },
            },
          },
        },
        "400": {
          description: "No file or filename provided, or file is not JSON",
        },
        "401": {
          description: "Invalid API key",
        },
        "403": {
          description: "Forbidden: admin mode required",
        },
        "500": {
          description: "Internal server error",
        },
      },
      security: [{ apikey: [] }],
    },
  },
}
