import { headers } from "next/headers"

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const withAuth = (
  handler: (auth: {
    request: Request
    prisma: PrismaClient
    user: { id: string } | null
    apiKey?: { mode: string; user_id: string } | null
    timestamp: string
  }) => void
) => {
  return async (request: Request) => {
    const timestamp = new Date().toISOString()

    const headerStore = headers()
    const authHeader = headerStore.get("authorization")

    const commonProps = {
      timestamp,
      request,
      prisma,
    }

    // If there is an auth header, validate api key
    if (authHeader) {
      const apiKey = authHeader.split(" ")[1]

      const user = await prisma.apiAuthToken.findUnique({
        where: {
          token: apiKey,
        },
      })

      // api key is invalid
      if (!user) {
        return handler({ ...commonProps, user: null })
      }

      return handler({
        ...commonProps,
        user: { id: user.userId },
        apiKey: { mode: user.mode, user_id: user.userId },
      })
    }

    // TODO: If there is no auth header, then the user is likely logged in
    // const user = await client.auth.getUser()

    return handler({ ...commonProps, user: null, apiKey: null })
  }
}
