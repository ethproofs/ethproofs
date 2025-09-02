import { addDays, startOfDay } from "date-fns"
import { and, asc, eq, notIlike, sql } from "drizzle-orm"
import { unstable_cache as cache } from "next/cache"

import { TAGS } from "@/lib/constants"

import { db } from "@/db"
import {
  clusterSummary as clusterSummaryView,
  recentSummary as recentSummaryView,
  teams,
  teamsSummary as teamsSummaryView,
} from "@/db/schema"

/**
 * Fetches daily proof statistics for a specified date range
 * @param days - Number of days to include (e.g., 7, 30, 90, 365)
 */
export const fetchProofsDailyStats = async (days: number) => {
  const safeDays = Number.isFinite(days) ? Math.max(0, Math.floor(days)) : 0
  const endDate = new Date()
  const startDate = startOfDay(addDays(endDate, -safeDays))

  return db.query.proofsDailyStats.findMany({
    where: (stats, { and, gte, lte }) =>
      and(
        gte(stats.date, startDate.toISOString()),
        lte(stats.date, endDate.toISOString())
      ),
    orderBy: (stats) => [asc(stats.date)],
  })
}

/**
 * Fetches daily prover statistics for a specific team and date range
 * @param teamId - Team ID
 * @param days - Number of days to include (e.g., 7, 30, 90, 365)
 */
export const fetchProverDailyStats = async (teamId: string, days: number) => {
  const safeDays = Number.isFinite(days) ? Math.max(0, Math.floor(days)) : 0
  const endDate = new Date()
  const startDate = startOfDay(addDays(endDate, -safeDays))

  return db.query.proverDailyStats.findMany({
    where: (stats, { and, eq, gte, lte }) =>
      and(
        eq(stats.team_id, teamId),
        gte(stats.date, startDate.toISOString()),
        lte(stats.date, endDate.toISOString())
      ),
    orderBy: (stats) => [asc(stats.date)],
  })
}

export const getRecentSummary = cache(
  async () => {
    const [recentSummary] = await db.select().from(recentSummaryView).limit(1)

    return recentSummary
  },
  ["recent-summary"],
  {
    revalidate: 60 * 60 * 1, // hourly
    tags: [TAGS.RECENT_SUMMARY],
  }
)

export const getClusterSummary = cache(
  async () => {
    const clusterSummary = await db.select().from(clusterSummaryView)

    return clusterSummary
  },
  ["cluster-summary"],
  {
    revalidate: 60 * 60 * 1, // hourly
    tags: [TAGS.CLUSTER_SUMMARY],
  }
)

export const getClusterSummaryById = async (id: string) => {
  return cache(
    async (id: string) => {
      const [clusterSummary] = await db
        .select()
        .from(clusterSummaryView)
        .where(eq(clusterSummaryView.cluster_id, id))
        .limit(1)

      return clusterSummary
    },
    ["cluster-summary", id],
    {
      revalidate: 60 * 60 * 1, // hourly
      tags: [TAGS.CLUSTER_SUMMARY],
    }
  )(id)
}

export const getTeamsSummary = cache(
  async () => {
    const teamsSummary = await db
      .select()
      .from(teamsSummaryView)
      .innerJoin(teams, eq(teamsSummaryView.team_id, teams.id))
      // hide test teams from the provers list
      .where(notIlike(teamsSummaryView.team_name, "%test%"))
      // sort by avg_proving_time, leave nulls or 0 last
      .orderBy(
        asc(
          sql`CASE WHEN ${teamsSummaryView.avg_proving_time} IS NULL OR ${teamsSummaryView.avg_proving_time} = 0 THEN 1 ELSE 0 END`
        ),
        asc(teamsSummaryView.avg_proving_time)
      )

    return teamsSummary.map(({ teams, teams_summary }) => ({
      ...teams_summary,
      ...teams,
    }))
  },
  ["teams-summary"],
  {
    revalidate: 60 * 60 * 1, // hourly
    tags: [TAGS.TEAM_SUMMARY],
  }
)

export const getTeamSummary = async (teamId: string) => {
  const [teamSummary] = await db
    .select()
    .from(teamsSummaryView)
    .where(
      and(
        eq(teamsSummaryView.team_id, teamId),
        // hide test teams from the provers list
        notIlike(teamsSummaryView.team_name, "%test%")
      )
    )
    .limit(1)

  return teamSummary
}
