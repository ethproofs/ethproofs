import { headers } from "next/headers"

import { hashToken } from "../auth/hash-token"

import { withTelemetry } from "./with-telemetry"

import { db } from "@/db"

export const withAuth = <
  T extends Record<string, unknown> = Record<string, unknown>,
>(
  handler: (
    auth: {
      request: Request
      user: { id: string }
      apiKey?: { mode: string; team_id: string }
      timestamp: string
    },
    params: T
  ) => Promise<Response>
) =>
  withTelemetry(async (request: Request, params: T) => {
    const timestamp = new Date().toISOString()

    const headerStore = await headers()
    const authHeader = headerStore.get("authorization")
    const apiKey = authHeader ? authHeader.split(" ")[1] : ""
    const hashedKey = await hashToken(apiKey)

    const commonProps = {
      timestamp,
      request,
    }

    if (!apiKey) {
      return new Response("No API key provided", {
        status: 401,
      })
    }

    // If there is an auth header, validate API key
    const apiAuthToken = await db.query.apiAuthTokens.findFirst({
      columns: {
        mode: true,
        team_id: true,
      },
      where: (apiAuthToken, { eq }) => eq(apiAuthToken.token, hashedKey),
    })

    // API key is invalid
    if (!apiAuthToken) {
      return new Response("Invalid API key", {
        status: 401,
      })
    }

    return handler(
      {
        ...commonProps,
        user: { id: apiAuthToken.team_id },
        apiKey: apiAuthToken,
      },
      params
    )
  })
