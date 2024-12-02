import { createDocument } from "zod-openapi"

import { SITE_DEPLOY_URL, SITE_NAME, SITE_URL } from "../constants"

import { machinesPaths } from "./machines"
import { proofsPaths } from "./proofs"

export const document = createDocument({
  openapi: "3.1.0",
  info: {
    title: `${SITE_NAME} API`,
    description: `This document outlines the available API endpoints for ${SITE_NAME}.\n\n**Authentication**\n\nAll endpoints require authentication using an API key in the request header:\n\n\`Authorization: Bearer <api_key>\``,
    version: "0.0.1",
  },
  servers: [
    {
      url: new URL("/api/v0", SITE_DEPLOY_URL || SITE_URL).toString(),
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
