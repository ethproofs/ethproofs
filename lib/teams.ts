import { getTeam, getTeamBySlug } from "./api/teams"
import { getVendor, getVendorBySlug } from "./api/vendors"
import type { TeamSummary } from "./types"
import { isUUID } from "./utils"

/**
 * Get total number of proving teams who have proof timing/cost data in summary
 * (Actively proving teams)
 * @param data array of rows (TeamSummary) from teams_summary view
 * @returns
 */
export const getActiveProverCount = (data: TeamSummary[]): number =>
  data.filter((t) => !!t.avg_cost_per_proof && !!t.avg_proving_time).length

export const getTeamByIdOrSlug = async (idOrSlug: string) => {
  if (isUUID(idOrSlug)) {
    return getTeam(idOrSlug)
  }
  return getTeamBySlug(idOrSlug)
}

export const getVendorByIdOrSlug = async (idOrSlug: string) => {
  if (isUUID(idOrSlug)) {
    return getVendor(idOrSlug)
  }
  return getVendorBySlug(idOrSlug)
}
