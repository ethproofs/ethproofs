import { createDocument } from "zod-openapi"

import { machinesPaths } from "./machines"
import { proofsPaths } from "./proofs"

export const document = createDocument({
  openapi: "3.1.0",
  info: {
    title: "Ethproofs API",
    description: `This document outlines the available API endpoints for ethproofs.\n\n**Authentication**\n\nAll endpoints require authentication using an API key in the request header:\n\n\`Authorization: Bearer <api_key>\``,
    version: "0.0.1",
  },
  servers: [
    {
      url: "https://main--ethproofs.netlify.app/api/v0",
      description: "Testing server",
    },
    {
      url: "http://localhost:3000/api/v0",
      description: "Local server",
    },
  ],
  tags: [
    {
      name: "machines",
    },
    {
      name: "proofs",
    },
  ],
  paths: {
    ...machinesPaths,
    ...proofsPaths,
  },
  components: {
    securitySchemes: {
      apikey: {
        type: "apiKey",
        description:
          'Enter the token with the Bearer prefix, e.g. "Bearer <api_key>"',
        name: "Authorization",
        in: "header",
      },
    },
  },
})
