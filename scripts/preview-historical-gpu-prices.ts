/**
 * PREVIEW historical GPU price index entries (READ-ONLY)
 *
 * Shows what quarterly price entries WOULD be created without actually inserting them.
 * Safe to run against production - does NOT modify any data.
 *
 * Usage:
 *   DATABASE_URL="production-url" npx tsx scripts/preview-historical-gpu-prices.ts
 */

import { config } from "dotenv"
import postgres from "postgres"

config({ path: ".env.local" })

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set")
}

const sql = postgres(process.env.DATABASE_URL)

async function main() {
  console.log("🔍 PREVIEW MODE - No data will be modified\n")
  console.log("Analyzing historical pricing data...\n")

  try {
    // Extract quarterly pricing data
    const quarterlyData = await sql`
      SELECT
        DATE_TRUNC('quarter', p.proved_timestamp) as quarter_start,
        COUNT(DISTINCT p.proof_id) as proof_count,
        AVG(
          CASE
            WHEN (cm.machine_count * m.gpu_count[1]) > 0
            THEN (cm.cloud_instance_count * ci.hourly_price) / (cm.machine_count * m.gpu_count[1])
            ELSE ci.hourly_price
          END
        ) as avg_per_gpu_price,
        MIN(p.proved_timestamp) as earliest_proof,
        MAX(p.proved_timestamp) as latest_proof
      FROM proofs p
      INNER JOIN cluster_versions cv ON p.cluster_version_id = cv.id
      INNER JOIN cluster_machines cm ON cv.id = cm.cluster_version_id
      INNER JOIN cloud_instances ci ON cm.cloud_instance_id = ci.id
      INNER JOIN machines m ON cm.machine_id = m.id
      WHERE p.proof_status = 'proved'
        AND p.proved_timestamp IS NOT NULL
        AND ci.hourly_price IS NOT NULL
        AND ci.hourly_price > 0
      GROUP BY quarter_start
      ORDER BY quarter_start ASC
    `

    if (quarterlyData.length === 0) {
      console.log("❌ No historical proof data found.")
      await sql.end()
      return
    }

    console.log(`Found ${quarterlyData.length} quarters with proof data:\n`)
    console.log("=".repeat(80))

    // Display what WOULD be created
    quarterlyData.forEach((quarter, idx) => {
      // Use earliest_proof to avoid timezone issues with quarter_start
      const date = new Date(quarter.earliest_proof)
      const quarterNum = Math.floor(date.getUTCMonth() / 3) + 1
      const year = date.getUTCFullYear()
      const gpuName = `Historical Q${quarterNum} ${year}`
      const hourlyPrice = Number(quarter.avg_per_gpu_price).toFixed(6)

      // Use the actual quarter start for created_at (first day of quarter in UTC)
      const quarterStartMonth = (quarterNum - 1) * 3
      const createdAt = new Date(Date.UTC(year, quarterStartMonth, 1))

      console.log(`\n${idx + 1}. ${gpuName}`)
      console.log(`   GPU Name: "${gpuName}"`)
      console.log(`   Hourly Price: ${hourlyPrice}`)
      console.log(`   Created At: ${createdAt.toISOString()}`)
      console.log(`   Proofs: ${quarter.proof_count}`)
      console.log(
        `   Date Range: ${new Date(quarter.earliest_proof).toLocaleDateString()} - ${new Date(quarter.latest_proof).toLocaleDateString()}`
      )
    })

    console.log("\n" + "=".repeat(80))
    console.log("\n📋 SQL to manually create these entries:\n")

    quarterlyData.forEach((quarter) => {
      // Use earliest_proof to avoid timezone issues
      const date = new Date(quarter.earliest_proof)
      const quarterNum = Math.floor(date.getUTCMonth() / 3) + 1
      const year = date.getUTCFullYear()
      const gpuName = `Historical Q${quarterNum} ${year}`
      const hourlyPrice = Number(quarter.avg_per_gpu_price).toFixed(6)

      // Use the actual quarter start for created_at (first day of quarter in UTC)
      const quarterStartMonth = (quarterNum - 1) * 3
      const createdAt = new Date(
        Date.UTC(year, quarterStartMonth, 1)
      ).toISOString()

      console.log(
        `INSERT INTO gpu_price_index (gpu_name, hourly_price, created_at) VALUES ('${gpuName}', ${hourlyPrice}, '${createdAt}');`
      )
    })

    console.log("\n" + "=".repeat(80))
    console.log("\n✅ Preview complete - no data was modified")
    console.log("\nNext steps:")
    console.log("1. Copy the INSERT statements above")
    console.log("2. Run them against your local database")
    console.log("3. Run scripts/backfill-proof-prices.ts to update proofs\n")
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
