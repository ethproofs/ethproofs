import type {
  RtpCohortMember,
  RtpCohortRow,
  RtpProofTimeBucket,
  RtpWeekEntry,
} from "@/lib/types"

export function toCohortRow(row: Record<string, unknown>): RtpCohortRow {
  return {
    cluster_id: String(row.cluster_id),
    cluster_name: String(row.cluster_name),
    num_gpus: Number(row.num_gpus),
    hardware_description: row.hardware_description
      ? String(row.hardware_description)
      : null,
    team_name: String(row.team_name),
    team_slug: String(row.team_slug),
    team_logo_url: row.team_logo_url ? String(row.team_logo_url) : null,
    zkvm_name: String(row.zkvm_name),
    guest_program_name: row.guest_program_name
      ? String(row.guest_program_name)
      : null,
    soundcalc_integration: Boolean(row.soundcalc_integration),
    total_blocks: Number(row.total_blocks),
    blocks_proven: Number(row.blocks_proven),
    sub_10s_proofs: Number(row.sub_10s_proofs),
    over_10s_proofs: Number(row.over_10s_proofs),
    paralyzed_blocks: Number(row.paralyzed_blocks),
    performance_score: Number(row.performance_score),
    liveness_score: Number(row.liveness_score),
    stunner_rate: Number(row.stunner_rate),
    paralyzer_rate: Number(row.paralyzer_rate),
    is_eligible: Boolean(row.is_eligible),
    avg_cost_per_proof:
      row.avg_cost_per_proof != null ? Number(row.avg_cost_per_proof) : null,
  }
}

function isWeekEntry(value: unknown): value is RtpWeekEntry {
  if (typeof value !== "object" || value === null) return false
  const entry = value as Record<string, unknown>
  return typeof entry.week === "string" && typeof entry.isEligible === "boolean"
}

export function parseWeeklyTimeline(raw: unknown): RtpWeekEntry[] {
  const parsed = typeof raw === "string" ? JSON.parse(raw) : raw
  if (!Array.isArray(parsed)) return []
  return parsed.filter(isWeekEntry)
}

export function toCohortMember(row: Record<string, unknown>): RtpCohortMember {
  const totalWeeks = Number(row.total_weeks)
  const weeksEligible = Number(row.weeks_in_cohort)
  return {
    clusterName: String(row.cluster_name),
    teamName: String(row.team_name),
    teamLogoUrl: row.team_logo_url ? String(row.team_logo_url) : null,
    weeksEligible,
    totalWeeks,
    eligibilityRate:
      totalWeeks > 0 ? Math.round((weeksEligible / totalWeeks) * 100) : 0,
    isCurrentlyEvaluated: Boolean(row.is_currently_eligible),
    weeklyTimeline: parseWeeklyTimeline(row.weekly_timeline),
  }
}

export function toProofTimeBucket(
  row: Record<string, unknown>,
  total: number,
  bucketOrder: readonly string[]
): RtpProofTimeBucket {
  const bucket = String(row.bucket)
  const count = Number(row.count)
  return {
    bucket,
    count,
    percentage: total > 0 ? Math.round((count / total) * 10000) / 100 : 0,
    isRtp: bucketOrder.indexOf(bucket) < 3,
  }
}

export function buildCompositionData(rows: Record<string, unknown>[]): {
  currentEligibleCount: number
  avgTenureWeeks: number
  trackedPeriodWeeks: number
  members: RtpCohortMember[]
} {
  const members = rows.map((row) => toCohortMember(row))

  const trackedPeriodWeeks = members.length > 0 ? members[0].totalWeeks : 0
  const currentlyEligible = members.filter((m) => {
    const lastWeek = m.weeklyTimeline[m.weeklyTimeline.length - 1]
    return lastWeek?.isEligible
  })
  const avgTenureWeeks =
    currentlyEligible.length > 0
      ? Math.round(
          currentlyEligible.reduce((sum, m) => sum + m.weeksEligible, 0) /
            currentlyEligible.length
        )
      : 0

  return {
    currentEligibleCount: currentlyEligible.length,
    avgTenureWeeks,
    trackedPeriodWeeks,
    members,
  }
}
