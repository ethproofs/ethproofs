import { count, eq, notIlike } from "drizzle-orm"
import { unstable_cache as cache } from "next/cache"

import { TAGS } from "@/lib/constants"

import { db } from "@/db"
import { teams } from "@/db/schema"

interface UpdateTeamData {
  name?: string
  github_org?: string | null
  twitter_handle?: string | null
  website_url?: string | null
}

export async function updateTeam(id: string, data: UpdateTeamData) {
  await db.update(teams).set(data).where(eq(teams.id, id))
}

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
    tags: [TAGS.TEAMS],
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
    tags: [TAGS.TEAMS],
  }
)
