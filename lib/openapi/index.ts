import { createDocument } from "zod-openapi"

import { SITE_NAME, SITE_PREVIEW_URL } from "../constants"

import { awsPricingListPaths } from "./aws-pricing-list"
import { clustersPaths } from "./clusters"
import { proofsPaths } from "./proofs"
import { singleMachinePaths } from "./single-machine"

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
    // TODO: Uncomment when prod is ready
    // {
    //   url: new URL("/api/v0", SITE_URL).toString(),
    //   description: "Main server",
    // },
    {
      url: new URL("/api/v0", SITE_PREVIEW_URL).toString(),
      description: "Testing server",
    },
  ],
  tags: [
    {
      name: "Clusters",
    },
    {
      name: "Single machine",
    },
    {
      name: "Proofs",
    },
    {
      name: "Aws pricing list",
    },
  ],
  paths: {
    ...clustersPaths,
    ...singleMachinePaths,
    ...proofsPaths,
    ...awsPricingListPaths,
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
