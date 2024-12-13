import { nanoid } from "nanoid"
import { createClient } from "@supabase/supabase-js"

import "dotenv-flow/config"

import { hashToken } from "@/lib/auth/hash-token"

const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

// Temporary script to create keys manually
// TODO: Replace with a proper auth system

async function main() {
  const token = nanoid(24)
  console.log({ token })
  const hashedKey = await hashToken(token)

  const { error } = await client.from("api_auth_tokens").insert({
    token: hashedKey,
    mode: "all",
    user_id: "...",
  })

  if (error) {
    console.error("Error creating key", error)
    return
  }

  console.log("Key created successfully")
}

main()
