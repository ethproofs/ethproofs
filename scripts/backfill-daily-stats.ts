/**
 * Re-backfill proofs_daily_stats and prover_daily_stats tables
 *
 * Run this after proofs have been updated with gpu_price_index_id to
 * recalculate historical cost data.
 *
 * Usage:
 *   npx tsx scripts/backfill-daily-stats.ts
 */

import { config } from "dotenv"
import postgres from "postgres"

config({ path: ".env.local" })

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set")
}

const sql = postgres(process.env.DATABASE_URL)

async function main() {
  console.log("Re-backfilling daily stats tables...\n")

  try {
    const [{ count: proofCount }] = await sql`
      SELECT COUNT(*) as count FROM proofs WHERE proof_status = 'proved'
    `
    const [{ count: proofsWithPrice }] = await sql`
      SELECT COUNT(*) as count FROM proofs
      WHERE proof_status = 'proved' AND gpu_price_index_id IS NOT NULL
    `
    const [{ count: proofsWithoutPrice }] = await sql`
      SELECT COUNT(*) as count FROM proofs
      WHERE proof_status = 'proved' AND gpu_price_index_id IS NULL
    `

    console.log(`Total proved proofs: ${proofCount}`)
    console.log(`  - With gpu_price_index_id: ${proofsWithPrice}`)
    console.log(`  - Without gpu_price_index_id: ${proofsWithoutPrice}\n`)

    console.log("Step 1: Truncating and re-populating proofs_daily_stats...")

    await sql`TRUNCATE TABLE proofs_daily_stats`

    const proofsResult = await sql`
      INSERT INTO proofs_daily_stats (
        date,
        avg_cost,
        median_cost,
        avg_latency,
        median_latency,
        total_proofs
      )
      SELECT
        DATE(p.proved_timestamp) as date,
        COALESCE(AVG(c.num_gpus::double precision * gpi.hourly_price * (p.proving_time::numeric / (1000.0 * 60::numeric * 60::numeric))::double precision), 0) as avg_cost,
        COALESCE(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY c.num_gpus::double precision * gpi.hourly_price * (p.proving_time::numeric / (1000.0 * 60::numeric * 60::numeric))::double precision), 0) as median_cost,
        COALESCE(AVG(p.proving_time)::integer, 0) as avg_latency,
        COALESCE(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY p.proving_time)::integer, 0) as median_latency,
        COUNT(p.proof_id) as total_proofs
      FROM
        proofs p
        JOIN cluster_versions cv ON p.cluster_version_id = cv.id
        JOIN clusters c ON cv.cluster_id = c.id
        LEFT JOIN gpu_price_index gpi ON p.gpu_price_index_id = gpi.id
      WHERE
        p.proof_status = 'proved'
        AND p.proved_timestamp IS NOT NULL
      GROUP BY
        DATE(p.proved_timestamp)
      ON CONFLICT (date) DO UPDATE SET
        avg_cost = EXCLUDED.avg_cost,
        median_cost = EXCLUDED.median_cost,
        avg_latency = EXCLUDED.avg_latency,
        median_latency = EXCLUDED.median_latency,
        total_proofs = EXCLUDED.total_proofs
    `

    console.log(
      `  ✓ Inserted ${proofsResult.count} rows into proofs_daily_stats\n`
    )

    console.log("Step 2: Truncating and re-populating prover_daily_stats...")

    await sql`TRUNCATE TABLE prover_daily_stats`

    const proverResult = await sql`
      INSERT INTO prover_daily_stats (
        date,
        team_id,
        avg_cost,
        median_cost,
        avg_latency,
        median_latency,
        total_proofs
      )
      SELECT
        DATE(p.proved_timestamp) as date,
        p.team_id,
        COALESCE(AVG(c.num_gpus::double precision * gpi.hourly_price * (p.proving_time::numeric / (1000.0 * 60::numeric * 60::numeric))::double precision), 0) as avg_cost,
        COALESCE(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY c.num_gpus::double precision * gpi.hourly_price * (p.proving_time::numeric / (1000.0 * 60::numeric * 60::numeric))::double precision), 0) as median_cost,
        COALESCE(AVG(p.proving_time)::integer, 0) as avg_latency,
        COALESCE(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY p.proving_time)::integer, 0) as median_latency,
        COUNT(p.proof_id) as total_proofs
      FROM
        proofs p
        JOIN cluster_versions cv ON p.cluster_version_id = cv.id
        JOIN clusters c ON cv.cluster_id = c.id
        LEFT JOIN gpu_price_index gpi ON p.gpu_price_index_id = gpi.id
      WHERE
        p.proof_status = 'proved'
        AND p.proved_timestamp IS NOT NULL
      GROUP BY
        DATE(p.proved_timestamp),
        p.team_id
      ON CONFLICT (date, team_id) DO UPDATE SET
        avg_cost = EXCLUDED.avg_cost,
        median_cost = EXCLUDED.median_cost,
        avg_latency = EXCLUDED.avg_latency,
        median_latency = EXCLUDED.median_latency,
        total_proofs = EXCLUDED.total_proofs
    `

    console.log(
      `  ✓ Inserted ${proverResult.count} rows into prover_daily_stats\n`
    )

    console.log("Step 3: Verifying results...")

    const [{ count: dailyStatsCount }] = await sql`
      SELECT COUNT(*) as count FROM proofs_daily_stats WHERE avg_cost > 0
    `
    const [{ count: dailyStatsZero }] = await sql`
      SELECT COUNT(*) as count FROM proofs_daily_stats WHERE avg_cost = 0
    `

    console.log(`  proofs_daily_stats rows with cost > 0: ${dailyStatsCount}`)
    console.log(`  proofs_daily_stats rows with cost = 0: ${dailyStatsZero}\n`)

    const sample = await sql`
      SELECT date, avg_cost, median_cost, total_proofs
      FROM proofs_daily_stats
      ORDER BY date DESC
      LIMIT 10
    `

    console.log("Sample of recent proofs_daily_stats:\n")
    sample.forEach((row) => {
      console.log(
        `  ${row.date.toISOString().split("T")[0]}: avg=$${Number(row.avg_cost).toFixed(4)}, median=$${Number(row.median_cost).toFixed(4)}, proofs=${row.total_proofs}`
      )
    })

    console.log("\n✅ Daily stats backfill complete!")
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
