import { createClient } from "@/utils/supabase/server"
import { headers } from "next/headers"

export const withAuth = (
  handler: (auth: {
    request: Request
    client: any
    user: any | null
    apiKey?: any
  }) => void
) => {
  return async (request: Request) => {
    const headerStore = headers()
    const authHeader = headerStore.get("authorization")
    console.log({ authHeader })

    // Get the user from the session
    const client = createClient({
      global: {
        headers: {
          ethkey: authHeader ? authHeader.split(" ")[1] : "",
        },
      },
    })

    // If there is an auth header, validate api key
    if (authHeader) {
      const apiKey = authHeader.split(" ")[1]
      console.log({ apiKey })

      const { data, error } = await client
        .from("api_auth_tokens")
        .select("mode, user_id")
        .eq("token", apiKey)
        .single()

      console.log({ data, error })

      // api key is invalid
      if (error) {
        return handler({ request, client, user: null })
      }

      // fetch the user
      if (data) {
        return handler({
          request,
          client,
          user: { id: data.user_id },
          apiKey: data,
        })
      }
    }

    // TODO: If there is no auth header, then the user is likely logged in
    // const user = await client.auth.getUser()

    return handler({ request, client, user: null, apiKey: null })
  }
}
