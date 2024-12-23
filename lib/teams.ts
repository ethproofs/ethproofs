import type { TeamSummary } from "./types"

/**
 * Get total number of proving teams who have proof timing/cost data in summary
 * (Actively proving teams)
 * @param data array of rows (TeamSummary) from teams_summary view
 * @returns
 */
export const getActiveProverCount = (data: TeamSummary[]): number =>
  data.filter((t) => !!t.avg_cost_per_proof && !!t.avg_proving_time).length
