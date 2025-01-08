import { headers } from "next/headers"

import { hashToken } from "./hash-token"

import { db } from "@/db"

export const withAuth = (
  handler: (auth: {
    request: Request
    user: { id: string } | null
    apiKey?: { mode: string; team_id: string } | null
    timestamp: string
  }) => void
) => {
  return async (request: Request) => {
    const timestamp = new Date().toISOString()

    const headerStore = headers()
    const authHeader = headerStore.get("authorization")
    const apiKey = authHeader ? authHeader.split(" ")[1] : ""
    const hashedKey = await hashToken(apiKey)

    const commonProps = {
      timestamp,
      request,
    }

    // If there is an auth header, validate api key
    if (apiKey) {
      const apiAuthToken = await db.query.apiAuthTokens.findFirst({
        columns: {
          mode: true,
          team_id: true,
        },
        where: (apiAuthToken, { eq }) => eq(apiAuthToken.token, hashedKey),
      })

      // api key is invalid
      if (!apiAuthToken) {
        return handler({ ...commonProps, user: null })
      }

      // fetch the user
      if (apiAuthToken) {
        return handler({
          ...commonProps,
          user: { id: apiAuthToken.team_id },
          apiKey: apiAuthToken,
        })
      }
    }

    // TODO: If there is no auth header, then the user is likely logged in
    // const user = await client.auth.getUser()

    return handler({ ...commonProps, user: null, apiKey: null })
  }
}
