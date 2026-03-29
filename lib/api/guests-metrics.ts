import { sql } from "drizzle-orm"

import type { GuestDiversityPoint, GuestSummaryData } from "@/lib/types"

import { db } from "@/db"

export async function fetchGuestSummary(): Promise<GuestSummaryData> {
  const [distributionResult, activeCountResult] = await Promise.all([
    db.execute(sql`
      SELECT
        gp.name,
        COUNT(p.proof_id)::integer AS proof_count
      FROM proofs p
      INNER JOIN blocks b ON p.block_number = b.block_number
      INNER JOIN cluster_versions cv ON p.cluster_version_id = cv.id
      INNER JOIN clusters c ON cv.cluster_id = c.id
      INNER JOIN guest_programs gp ON c.guest_program_id = gp.id
      WHERE p.proof_status = 'proved'
        AND c.is_active = true AND c.is_approved = true
        AND cv.is_active = true
        AND b.timestamp >= NOW() - interval '7 days'
        AND NOT is_downtime_block(b.block_number)
      GROUP BY gp.id, gp.name
      ORDER BY proof_count DESC
    `),
    db.execute(sql`
      SELECT
        COUNT(DISTINCT gp.id)::integer AS current_count,
        (
          SELECT COUNT(DISTINCT gp2.id)::integer
          FROM guest_programs gp2
          INNER JOIN clusters c2 ON c2.guest_program_id = gp2.id
          WHERE c2.is_active = true
            AND c2.created_at < NOW() - interval '30 days'
        ) AS previous_count
      FROM guest_programs gp
      INNER JOIN clusters c ON c.guest_program_id = gp.id
      WHERE c.is_active = true AND c.is_approved = true
    `),
  ])

  const distRows = Array.isArray(distributionResult) ? distributionResult : []
  const totalProofs = distRows.reduce(
    (sum: number, row: Record<string, unknown>) =>
      sum + Number(row.proof_count ?? 0),
    0
  )

  const distribution = distRows.map((row: Record<string, unknown>) => ({
    name: String(row.name ?? ""),
    share:
      totalProofs > 0 ? (Number(row.proof_count ?? 0) / totalProofs) * 100 : 0,
  }))

  const dominant = distribution[0] ?? { name: "none", share: 0 }

  const activeRow =
    Array.isArray(activeCountResult) && activeCountResult.length > 0
      ? (activeCountResult[0] as Record<string, unknown>)
      : {}
  const currentCount = Number(activeRow.current_count ?? 0)
  const previousCount = Number(activeRow.previous_count ?? 0)
  const activeGuestsChange =
    previousCount > 0
      ? ((currentCount - previousCount) / previousCount) * 100
      : 0

  return {
    dominantGuest: dominant.name,
    dominantGuestShare: dominant.share,
    distribution,
    activeGuestsCount: currentCount,
    activeGuestsChange,
    totalProofs,
  }
}

export async function fetchGuestDiversityTrend(): Promise<
  GuestDiversityPoint[]
> {
  const result = await db.execute(sql`
    SELECT
      gp.name AS guest_name,
      date_trunc('week', b.timestamp::timestamptz) AS week,
      COUNT(p.proof_id)::integer AS proof_count
    FROM proofs p
    INNER JOIN blocks b ON p.block_number = b.block_number
    INNER JOIN cluster_versions cv ON p.cluster_version_id = cv.id
    INNER JOIN clusters c ON cv.cluster_id = c.id
    INNER JOIN guest_programs gp ON c.guest_program_id = gp.id
    WHERE p.proof_status = 'proved'
      AND b.timestamp >= NOW() - interval '6 months'
      AND NOT is_downtime_block(b.block_number)
    GROUP BY gp.name, date_trunc('week', b.timestamp::timestamptz)
    ORDER BY gp.name, week
  `)

  const rows = Array.isArray(result) ? result : []

  const weekTotals = new Map<string, number>()
  for (const row of rows) {
    const r = row as Record<string, unknown>
    const week = String(r.week ?? "")
    const count = Number(r.proof_count ?? 0)
    weekTotals.set(week, (weekTotals.get(week) ?? 0) + count)
  }

  return rows.map((row: Record<string, unknown>) => {
    const week = String(row.week ?? "")
    const count = Number(row.proof_count ?? 0)
    const total = weekTotals.get(week) ?? 1
    return {
      week,
      guestName: String(row.guest_name ?? ""),
      proofCount: count,
      share: (count / total) * 100,
    }
  })
}
