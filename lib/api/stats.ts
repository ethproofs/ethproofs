import { addDays, startOfDay } from "date-fns"
import { and, asc, eq, notIlike } from "drizzle-orm"

import { db } from "@/db"
import {
  clusterSummary as clusterSummaryView,
  recentSummary as recentSummaryView,
  teamsSummary as teamsSummaryView,
} from "@/db/schema"

/**
 * Fetches daily proof statistics for a specified date range
 * @param days - Number of days to include (e.g., 7, 30, 90, 365)
 */
export const fetchProofsDailyStats = async (days: number) => {
  const endDate = new Date()
  const startDate = startOfDay(addDays(endDate, -days))

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
  const endDate = new Date()
  const startDate = startOfDay(addDays(endDate, -days))

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

export const getRecentSummary = async () => {
  const [recentSummary] = await db.select().from(recentSummaryView).limit(1)

  return recentSummary
}

export const getClusterSummary = async () => {
  const clusterSummary = await db.select().from(clusterSummaryView)

  return clusterSummary
}

export const getClusterSummaryById = async (id: string) => {
  const [clusterSummary] = await db
    .select()
    .from(clusterSummaryView)
    .where(eq(clusterSummaryView.cluster_id, id))
    .limit(1)

  return clusterSummary
}

export const getTeamsSummary = async () => {
  const teamsSummary = await db
    .select()
    .from(teamsSummaryView)
    // hide test teams from the provers list
    .where(notIlike(teamsSummaryView.team_name, "%test%"))
    .orderBy(asc(teamsSummaryView.avg_proving_time))

  return teamsSummary
}

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
