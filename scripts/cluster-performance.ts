/**
 * Cluster Performance Score by Month
 *
 * Checks each cluster's monthly performance:
 *   - "performance" = % of proofs with proving_time <= 12s (12000ms)
 *   - Filters to clusters with security_target_bits >= 100
 *   - Shows monthly breakdown, then clusters meeting 99% performance
 *
 * Usage:
 *   npx tsx scripts/cluster-performance.ts [months]
 *
 * Output: cluster-performance-output.txt
 */

import { writeFileSync } from "fs"

import { config } from "dotenv"
import postgres from "postgres"

config({ path: ".env.local" })

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set")
}

const sql = postgres(process.env.DATABASE_URL)

const monthsToCheck = Number(process.argv[2]) || 6

interface MonthlyRow {
  cluster_name: string
  cluster_id: string
  security_target_bits: number
  month: string
  total_proofs: number
  proofs_within_12s: number
  proofs_over_12s: number
  performance_score: string
}

interface SummaryRow {
  cluster_name: string
  cluster_id: string
  security_target_bits: number
  total_proofs: number
  total_within_12s: number
  overall_performance: string
  months_active: number
  months_at_99_pct: number
  meets_99_pct_threshold: string
}

async function main() {
  console.log(
    `Checking cluster performance over the last ${monthsToCheck} months...\n`
  )

  try {
    const monthlyRows = await sql<MonthlyRow[]>`
      WITH monthly_performance AS (
        SELECT
          p.cluster_id,
          c.name AS cluster_name,
          zsm.security_target_bits,
          date_trunc('month', p.proved_timestamp) AS month,
          COUNT(*)::int AS total_proofs,
          COUNT(*) FILTER (WHERE p.proving_time <= 12000)::int AS proofs_within_12s,
          ROUND(
            100.0 * COUNT(*) FILTER (WHERE p.proving_time <= 12000) / COUNT(*),
            2
          ) AS performance_score
        FROM proofs p
        JOIN clusters c ON c.id = p.cluster_id
        JOIN cluster_versions cv ON cv.id = p.cluster_version_id
        JOIN zkvm_versions zv ON zv.id = cv.zkvm_version_id
        JOIN zkvm_security_metrics zsm ON zsm.zkvm_id = zv.zkvm_id
        WHERE p.proof_status = 'proved'
          AND p.proved_timestamp IS NOT NULL
          AND p.proving_time IS NOT NULL
          AND p.proved_timestamp >= date_trunc('month', NOW()) - ${monthsToCheck + " months"}::interval
        GROUP BY p.cluster_id, c.name, zsm.security_target_bits, date_trunc('month', p.proved_timestamp)
      )
      SELECT
        cluster_name,
        cluster_id,
        security_target_bits,
        to_char(month, 'YYYY-MM') AS month,
        total_proofs,
        proofs_within_12s,
        (total_proofs - proofs_within_12s)::int AS proofs_over_12s,
        performance_score || '%' AS performance_score
      FROM monthly_performance
      WHERE security_target_bits >= 100
      ORDER BY cluster_name, month
    `

    const summaryRows = await sql<SummaryRow[]>`
      WITH monthly_performance AS (
        SELECT
          p.cluster_id,
          c.name AS cluster_name,
          zsm.security_target_bits,
          date_trunc('month', p.proved_timestamp) AS month,
          COUNT(*)::int AS total_proofs,
          COUNT(*) FILTER (WHERE p.proving_time <= 12000)::int AS proofs_within_12s,
          ROUND(
            100.0 * COUNT(*) FILTER (WHERE p.proving_time <= 12000) / COUNT(*),
            2
          ) AS performance_score
        FROM proofs p
        JOIN clusters c ON c.id = p.cluster_id
        JOIN cluster_versions cv ON cv.id = p.cluster_version_id
        JOIN zkvm_versions zv ON zv.id = cv.zkvm_version_id
        JOIN zkvm_security_metrics zsm ON zsm.zkvm_id = zv.zkvm_id
        WHERE p.proof_status = 'proved'
          AND p.proved_timestamp IS NOT NULL
          AND p.proving_time IS NOT NULL
          AND p.proved_timestamp >= date_trunc('month', NOW()) - ${monthsToCheck + " months"}::interval
        GROUP BY p.cluster_id, c.name, zsm.security_target_bits, date_trunc('month', p.proved_timestamp)
      ),
      overall AS (
        SELECT
          cluster_id,
          cluster_name,
          security_target_bits,
          SUM(total_proofs)::int AS total_proofs,
          SUM(proofs_within_12s)::int AS total_within_12s,
          ROUND(100.0 * SUM(proofs_within_12s) / SUM(total_proofs), 2) AS overall_performance,
          COUNT(DISTINCT month)::int AS months_active,
          (COUNT(DISTINCT month) FILTER (WHERE performance_score >= 99))::int AS months_at_99_pct
        FROM monthly_performance
        WHERE security_target_bits >= 100
        GROUP BY cluster_id, cluster_name, security_target_bits
      )
      SELECT
        cluster_name,
        cluster_id,
        security_target_bits,
        total_proofs,
        total_within_12s,
        overall_performance || '%' AS overall_performance,
        months_active,
        months_at_99_pct,
        CASE
          WHEN overall_performance >= 99 THEN 'PASS'
          ELSE 'FAIL'
        END AS meets_99_pct_threshold
      FROM overall
      ORDER BY overall_performance DESC, cluster_name
    `

    const csvRow = (values: (string | number)[]) =>
      values.map((v) => (String(v).includes(",") ? `"${v}"` : v)).join(",")

    const monthlyLines: string[] = [
      csvRow([
        "cluster_name",
        "cluster_id",
        "security_target_bits",
        "month",
        "total_proofs",
        "proofs_within_12s",
        "proofs_over_12s",
        "performance_score",
      ]),
      ...monthlyRows.map((row) =>
        csvRow([
          row.cluster_name,
          row.cluster_id,
          row.security_target_bits,
          row.month,
          row.total_proofs,
          row.proofs_within_12s,
          row.proofs_over_12s,
          row.performance_score,
        ])
      ),
    ]

    const summaryLines: string[] = [
      csvRow([
        "cluster_name",
        "cluster_id",
        "security_target_bits",
        "total_proofs",
        "total_within_12s",
        "overall_performance",
        "months_active",
        "months_at_99_pct",
        "meets_99_pct_threshold",
      ]),
      ...summaryRows.map((row) =>
        csvRow([
          row.cluster_name,
          row.cluster_id,
          row.security_target_bits,
          row.total_proofs,
          row.total_within_12s,
          row.overall_performance,
          row.months_active,
          row.months_at_99_pct,
          row.meets_99_pct_threshold,
        ])
      ),
    ]

    writeFileSync(
      "cluster-performance-monthly.csv",
      monthlyLines.join("\n") + "\n"
    )
    writeFileSync(
      "cluster-performance-summary.csv",
      summaryLines.join("\n") + "\n"
    )

    console.log(`Monthly breakdown: ${monthlyRows.length} rows`)
    console.log(`Summary: ${summaryRows.length} clusters\n`)

    console.log("Files written:")
    console.log("  cluster-performance-monthly.csv")
    console.log("  cluster-performance-summary.csv")
  } catch (error) {
    console.error("Error:", error)
    throw error
  } finally {
    await sql.end()
  }
}

main().catch((error) => {
  console.error("Failed:", error)
  process.exit(1)
})
