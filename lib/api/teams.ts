import { count, notIlike } from "drizzle-orm"
import { unstable_cache as cache } from "next/cache"

import { db } from "@/db"
import { teams } from "@/db/schema"

export const getTeam = cache(async (id: string) => {
  const team = await db.query.teams.findFirst({
    where: (teams, { eq }) => eq(teams.id, id),
  })

  return team
})

export const getTeams = cache(
  async () => {
    const teams = await db.query.teams.findMany()
    return teams
  },
  ["teams"],
  {
    revalidate: 60 * 60 * 24, // daily
    tags: ["teams"],
  }
)

export const getTeamBySlug = cache(async (slug: string) => {
  const team = await db.query.teams.findFirst({
    where: (teams, { eq }) => eq(teams.slug, slug),
  })
  return team
})

export const getTeamsCount = cache(
  async () => {
    const teamsCount = await db
      .select({ count: count() })
      .from(teams)
      // hide test teams from the provers list
      .where(notIlike(teams.name, "%test%"))

    return teamsCount[0].count
  },
  ["teams-count"],
  {
    revalidate: 60 * 60 * 24, // daily
    tags: ["teams"],
  }
)
