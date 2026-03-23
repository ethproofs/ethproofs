import { sql } from "drizzle-orm"
import { unstable_cache as cache } from "next/cache"

import { TAGS } from "@/lib/constants"

import { db } from "@/db"

export interface TeamContribution {
  teamId: string
  teamName: string
  teamSlug: string
  logoUrl: string | null
  hasZkvm: boolean
  hasGuest: boolean
  hasProver: boolean
  zkvmNames: string[]
  guestNames: string[]
  proverCount: number
  depth: number
}

export const fetchTeamContributions = cache(
  async (): Promise<TeamContribution[]> => {
    const rows = await db.execute<{
      team_id: string
      team_name: string
      team_slug: string
      logo_url: string | null
      zkvm_names: string | null
      guest_names: string | null
      prover_count: number
    }>(sql`
      SELECT
        t.id AS team_id,
        t.name AS team_name,
        t.slug AS team_slug,
        t.logo_url,
        (
          SELECT string_agg(DISTINCT z.name, ', ')
          FROM zkvms z
          WHERE z.team_id = t.id AND z.is_approved = true
        ) AS zkvm_names,
        (
          SELECT string_agg(DISTINCT gp.name, ', ')
          FROM guest_programs gp
          WHERE lower(gp.maintainer) = lower(t.name)
        ) AS guest_names,
        (
          SELECT count(DISTINCT c.id)::int
          FROM clusters c
          WHERE c.team_id = t.id AND c.is_active = true AND c.is_approved = true
        ) AS prover_count
      FROM teams t
      WHERE t.name NOT ILIKE '%test%'
      ORDER BY t.name
    `)

    return rows
      .map((row) => {
        const zkvmNames = row.zkvm_names ? row.zkvm_names.split(", ") : []
        const guestNames = row.guest_names ? row.guest_names.split(", ") : []
        const hasZkvm = zkvmNames.length > 0
        const hasGuest = guestNames.length > 0
        const hasProver = row.prover_count > 0
        const depth = [hasZkvm, hasGuest, hasProver].filter(Boolean).length

        return {
          teamId: row.team_id,
          teamName: row.team_name,
          teamSlug: row.team_slug,
          logoUrl: row.logo_url,
          hasZkvm,
          hasGuest,
          hasProver,
          zkvmNames,
          guestNames,
          proverCount: row.prover_count,
          depth,
        }
      })
      .filter((team) => team.depth > 0)
  },
  ["team-contributions"],
  {
    revalidate: 60 * 60,
    tags: [TAGS.TEAMS, TAGS.CLUSTERS, TAGS.ZKVMS],
  }
)

export interface TeamProofVolume {
  teamName: string
  teamSlug: string
  logoUrl: string | null
  totalProofs: number
  rtpProofs: number
  previousTotalProofs: number
  hasRtpProver: boolean
}

export interface ProofVolumeData {
  totalProofs: number
  rtpProofs: number
  rtpShare: number
  teams: TeamProofVolume[]
}

export const fetchProofVolumeByTeam = cache(
  async (days: number): Promise<ProofVolumeData> => {
    const safeDays = Math.max(7, Math.floor(days))

    const rows = await db.execute<{
      team_name: string
      team_slug: string
      logo_url: string | null
      total_proofs: number
      rtp_proofs: number
      previous_total_proofs: number
      has_rtp_prover: boolean
    }>(sql`
      WITH current_period AS (
        SELECT
          t.name AS team_name,
          t.slug AS team_slug,
          t.logo_url,
          count(p.proof_id)::int AS total_proofs,
          count(CASE WHEN p.proving_time < 10000 THEN 1 END)::int AS rtp_proofs
        FROM teams t
        LEFT JOIN proofs p ON t.id = p.team_id
          AND p.proof_status = 'proved'
          AND p.proved_timestamp >= now() - make_interval(days := ${safeDays})
        WHERE t.name NOT ILIKE '%test%'
        GROUP BY t.id, t.name, t.slug, t.logo_url
      ),
      previous_period AS (
        SELECT
          t.id AS team_id,
          count(p.proof_id)::int AS total_proofs
        FROM teams t
        LEFT JOIN proofs p ON t.id = p.team_id
          AND p.proof_status = 'proved'
          AND p.proved_timestamp >= now() - make_interval(days := ${safeDays * 2})
          AND p.proved_timestamp < now() - make_interval(days := ${safeDays})
        WHERE t.name NOT ILIKE '%test%'
        GROUP BY t.id
      ),
      rtp_provers AS (
        SELECT DISTINCT t.id AS team_id
        FROM teams t
        INNER JOIN clusters c ON c.team_id = t.id AND c.is_active = true AND c.is_approved = true
        INNER JOIN rtp_cohort_snapshots rcs ON rcs.cluster_id = c.id
        WHERE rcs.is_eligible = true
          AND rcs.snapshot_week = (SELECT max(snapshot_week) FROM rtp_cohort_snapshots)
      )
      SELECT
        cp.team_name,
        cp.team_slug,
        cp.logo_url,
        cp.total_proofs,
        cp.rtp_proofs,
        COALESCE(pp.total_proofs, 0)::int AS previous_total_proofs,
        COALESCE(rp.team_id IS NOT NULL, false) AS has_rtp_prover
      FROM current_period cp
      LEFT JOIN teams t2 ON t2.slug = cp.team_slug
      LEFT JOIN previous_period pp ON pp.team_id = t2.id
      LEFT JOIN rtp_provers rp ON rp.team_id = t2.id
      WHERE cp.total_proofs > 0
      ORDER BY cp.total_proofs DESC
    `)

    const teams = rows.map((row) => ({
      teamName: row.team_name,
      teamSlug: row.team_slug,
      logoUrl: row.logo_url,
      totalProofs: row.total_proofs,
      rtpProofs: row.rtp_proofs,
      previousTotalProofs: row.previous_total_proofs,
      hasRtpProver: row.has_rtp_prover,
    }))

    const totalProofs = teams.reduce((sum, t) => sum + t.totalProofs, 0)
    const rtpProofs = teams.reduce((sum, t) => sum + t.rtpProofs, 0)
    const rtpShare = totalProofs > 0 ? (rtpProofs / totalProofs) * 100 : 0

    return { totalProofs, rtpProofs, rtpShare, teams }
  },
  ["proof-volume-by-team"],
  {
    revalidate: 60 * 60,
    tags: [TAGS.TEAMS, TAGS.PROOFS],
  }
)

export interface TeamTableRow {
  teamId: string
  teamName: string
  teamSlug: string
  logoUrl: string | null
  contributionTypes: string[]
  zkvmCount: number
  guestCount: number
  proverCount: number
  totalProofs: number
  avgProvingTime: number
  performanceScore: number
  successRate: number
  avgCostPerProof: number
  isRtpEligible: boolean
}

export interface TeamsTableData {
  teams: TeamTableRow[]
  counts: {
    all: number
    zkvmMaintainers: number
    guestMaintainers: number
    proverOperators: number
  }
}

export const fetchTeamsTableData = cache(
  async (): Promise<TeamsTableData> => {
    const rows = await db.execute<{
      team_id: string
      team_name: string
      team_slug: string
      logo_url: string | null
      zkvm_count: number
      guest_count: number
      prover_count: number
      total_proofs: number
      avg_proving_time: number
      sub_10s_proofs: number
      over_10s_proofs: number
      avg_cost_per_proof: number
      has_rtp_eligible: boolean
    }>(sql`
      WITH team_zkvms AS (
        SELECT team_id, count(*)::int AS zkvm_count
        FROM zkvms
        WHERE is_approved = true
        GROUP BY team_id
      ),
      team_guests AS (
        SELECT t.id AS team_id, count(DISTINCT gp.id)::int AS guest_count
        FROM teams t
        INNER JOIN guest_programs gp ON lower(gp.maintainer) = lower(t.name)
        GROUP BY t.id
      ),
      team_provers AS (
        SELECT team_id, count(*)::int AS prover_count
        FROM clusters
        WHERE is_active = true
        GROUP BY team_id
      ),
      team_proof_stats AS (
        SELECT
          p.team_id,
          count(p.proof_id)::int AS total_proofs,
          COALESCE(avg(p.proving_time), 0)::float AS avg_proving_time,
          count(CASE WHEN p.proving_time < 10000 THEN 1 END)::int AS sub_10s_proofs,
          count(CASE WHEN p.proving_time >= 10000 THEN 1 END)::int AS over_10s_proofs,
          COALESCE(
            sum(c.num_gpus::double precision * gpi.hourly_price * (p.proving_time::numeric / 3600000.0)::double precision)
            / NULLIF(count(CASE WHEN c.num_gpus IS NOT NULL AND gpi.hourly_price IS NOT NULL AND p.proving_time IS NOT NULL THEN p.proof_id END), 0)::double precision,
            0
          )::float AS avg_cost_per_proof
        FROM proofs p
        LEFT JOIN cluster_versions cv ON p.cluster_version_id = cv.id
        LEFT JOIN clusters c ON cv.cluster_id = c.id
        LEFT JOIN gpu_price_index gpi ON p.gpu_price_index_id = gpi.id
        WHERE p.proof_status = 'proved'
        GROUP BY p.team_id
      ),
      rtp_teams AS (
        SELECT DISTINCT c.team_id
        FROM rtp_cohort_snapshots rcs
        INNER JOIN clusters c ON rcs.cluster_id = c.id AND c.is_active = true AND c.is_approved = true
        WHERE rcs.is_eligible = true
          AND rcs.snapshot_week = (SELECT max(snapshot_week) FROM rtp_cohort_snapshots)
      )
      SELECT
        t.id AS team_id,
        t.name AS team_name,
        t.slug AS team_slug,
        t.logo_url,
        COALESCE(tz.zkvm_count, 0)::int AS zkvm_count,
        COALESCE(tg.guest_count, 0)::int AS guest_count,
        COALESCE(tp.prover_count, 0)::int AS prover_count,
        COALESCE(tps.total_proofs, 0)::int AS total_proofs,
        COALESCE(tps.avg_proving_time, 0)::float AS avg_proving_time,
        COALESCE(tps.sub_10s_proofs, 0)::int AS sub_10s_proofs,
        COALESCE(tps.over_10s_proofs, 0)::int AS over_10s_proofs,
        COALESCE(tps.avg_cost_per_proof, 0)::float AS avg_cost_per_proof,
        COALESCE(rt.team_id IS NOT NULL, false) AS has_rtp_eligible
      FROM teams t
      LEFT JOIN team_zkvms tz ON tz.team_id = t.id
      LEFT JOIN team_guests tg ON tg.team_id = t.id
      LEFT JOIN team_provers tp ON tp.team_id = t.id
      LEFT JOIN team_proof_stats tps ON tps.team_id = t.id
      LEFT JOIN rtp_teams rt ON rt.team_id = t.id
      WHERE t.name NOT ILIKE '%test%'
      ORDER BY COALESCE(tps.total_proofs, 0) DESC, t.name
    `)

    const allTeams: TeamTableRow[] = rows.map((row) => {
      const contributionTypes: string[] = []
      if (row.zkvm_count > 0) contributionTypes.push("zkvm")
      if (row.guest_count > 0) contributionTypes.push("guest")
      if (row.prover_count > 0) contributionTypes.push("prover")

      const totalProofs = row.sub_10s_proofs + row.over_10s_proofs
      const successRate =
        totalProofs > 0 ? (row.sub_10s_proofs / totalProofs) * 100 : 0
      const performanceScore = successRate

      return {
        teamId: row.team_id,
        teamName: row.team_name,
        teamSlug: row.team_slug,
        logoUrl: row.logo_url,
        contributionTypes,
        zkvmCount: row.zkvm_count,
        guestCount: row.guest_count,
        proverCount: row.prover_count,
        totalProofs: row.total_proofs,
        avgProvingTime: row.avg_proving_time,
        performanceScore,
        successRate,
        avgCostPerProof: row.avg_cost_per_proof,
        isRtpEligible: row.has_rtp_eligible,
      }
    })

    const teams = allTeams.filter((t) => t.contributionTypes.length > 0)

    const zkvmMaintainers = teams.filter((t) => t.zkvmCount > 0).length
    const guestMaintainers = teams.filter((t) => t.guestCount > 0).length
    const proverOperators = teams.filter((t) => t.proverCount > 0).length

    return {
      teams,
      counts: {
        all: teams.length,
        zkvmMaintainers,
        guestMaintainers,
        proverOperators,
      },
    }
  },
  ["teams-table-data"],
  {
    revalidate: 60 * 60,
    tags: [TAGS.TEAMS, TAGS.CLUSTERS, TAGS.ZKVMS, TAGS.PROOFS],
  }
)
