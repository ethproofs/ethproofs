import { unstable_cache as cache } from "next/cache"

import { db } from "@/db"

export const getTeam = cache(
  async (id: string) => {
    const team = await db.query.teams.findFirst({
      columns: {
        name: true,
        storage_quota_bytes: true,
      },
      where: (teams, { eq }) => eq(teams.id, id),
    })

    return team
  },
  ["team"]
)
