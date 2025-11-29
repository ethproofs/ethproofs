import { config } from "dotenv"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

import * as relations from "./relations"
import * as schema from "./schema"

config({ path: ".env.local" })

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set")
}

// Configured for Supabase Shared Pooler (Transaction mode) with IPv4 support
const client = postgres(process.env.DATABASE_URL, { prepare: false })

export const db = drizzle({
  client,
  schema: { ...schema, ...relations },
  casing: "snake_case",
})
