import { z } from "zod"
import { ZodOpenApiPathsObject } from "zod-openapi"

export const verificationKeysPaths: ZodOpenApiPathsObject = {
  "/verification-keys/upload": {
    post: {
      tags: ["Verification keys"],
      summary: "Upload verification key",
      description: "Upload a verification key binary file to storage.",
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
                  description: "The verification key binary file to upload",
                },
                filename: {
                  type: "string",
                  description:
                    "The filename to use for storage (e.g., 'team-vk.bin')",
                  example: "team-vk.bin",
                },
              },
              required: ["file", "filename"],
            },
          },
        },
      },
      responses: {
        "200": {
          description: "Verification key uploaded successfully",
          content: {
            "application/json": {
              schema: z.object({
                message: z.string(),
                path: z.string(),
              }),
              example: {
                message: "Verification key uploaded successfully",
                path: "team-vk.bin",
              },
            },
          },
        },
        "400": {
          description: "No file or filename provided",
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
