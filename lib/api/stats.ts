import { addDays, startOfDay } from "date-fns"
import { asc } from "drizzle-orm"

import { db } from "@/db"

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
