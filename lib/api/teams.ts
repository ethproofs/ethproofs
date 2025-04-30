import { unstable_cache as cache } from "next/cache"

import { db } from "@/db"

export const getTeam = cache(
  async (id: string) => {
    const team = await db.query.teams.findFirst({
      where: (teams, { eq }) => eq(teams.id, id),
    })

    return team
  },
  ["team"]
)

export const getTeams = cache(async () => {
  const teams = await db.query.teams.findMany()
  return teams
})
