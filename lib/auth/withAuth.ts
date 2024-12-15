import { headers } from "next/headers"

import { hashToken } from "./hash-token"

import { createClient } from "@/utils/supabase/server"

export const withAuth = (
  handler: (auth: {
    request: Request
    client: ReturnType<typeof createClient>
    user: { id: string } | null
    apiKey?: { mode: string; user_id: string } | null
    timestamp: string
  }) => void
) => {
  return async (request: Request) => {
    const timestamp = new Date().toISOString()

    const headerStore = headers()
    const authHeader = headerStore.get("authorization")
    const apiKey = authHeader ? authHeader.split(" ")[1] : ""
    const hashedKey = await hashToken(apiKey)

    // Get the user from the session
    const client = createClient({
      global: {
        headers: {
          ethkey: hashedKey,
        },
      },
    })

    const commonProps = {
      timestamp,
      request,
      client,
    }

    // If there is an auth header, validate api key
    if (apiKey) {
      const { data, error } = await client
        .from("api_auth_tokens")
        .select("mode, user_id")
        .eq("token", hashedKey)
        .single()

      // api key is invalid
      if (error) {
        return handler({ ...commonProps, user: null })
      }

      // fetch the user
      if (data) {
        return handler({
          ...commonProps,
          user: { id: data.user_id },
          apiKey: data,
        })
      }
    }

    // TODO: If there is no auth header, then the user is likely logged in
    // const user = await client.auth.getUser()

    return handler({ ...commonProps, user: null, apiKey: null })
  }
}
