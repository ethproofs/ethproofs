import { Client } from "pg"
import { SeedPg } from "@snaplet/seed/adapter-pg"
import { defineConfig } from "@snaplet/seed/config"

export default defineConfig({
  adapter: async () => {
    const client = new Client({
      connectionString:
        "postgresql://postgres:postgres@127.0.0.1:54322/postgres",
    })
    await client.connect()
    return new SeedPg(client)
  },
  select: ["!*", "public*", "auth.users", "auth.identities", "auth.sessions"],
})
