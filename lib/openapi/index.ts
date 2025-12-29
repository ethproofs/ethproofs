import { createDocument } from "zod-openapi"

import { SITE_NAME, SITE_PREVIEW_URL, SITE_URL } from "../constants"

import { blocksPaths } from "./blocks"
import { clustersPaths } from "./clusters"
import { cspBenchmarksPaths } from "./csp-benchmarks"
import { proofsPaths } from "./proofs"

export const document = createDocument({
  openapi: "3.1.0",
  info: {
    title: `${SITE_NAME} API`,
    description: `This document outlines the available API endpoints for ${SITE_NAME}.
    \n\n**Base URL**
    \n\nAll API endpoints are relative to:
    \n\n\`${new URL("/api/v0", SITE_PREVIEW_URL).toString()}\`
    \n\n**Authentication**
    \n\nAll endpoints require authentication using an API key in the request header:
    \n\n\`Authorization: Bearer <api_key>\``,
    version: "0.0.1",
  },
  servers: [
    {
      url: new URL("/api/v0", SITE_URL).toString(),
      description: "Main server",
    },
    {
      url: new URL("/api/v0", SITE_PREVIEW_URL).toString(),
      description: "Testing server",
    },
  ],
  tags: [
    {
      name: "Blocks",
    },
    {
      name: "Clusters",
    },
    {
      name: "Proofs",
    },
    {
      name: "CSP benchmarks",
    },
  ],
  paths: {
    ...blocksPaths,
    ...clustersPaths,
    ...proofsPaths,
    ...cspBenchmarksPaths,
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
