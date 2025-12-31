/**
 * Create historical GPU price index entries based on quarterly averages
 * from the existing cloud_instances data.
 *
 * Run this BEFORE migration 0042_drop-machines.sql to preserve historical pricing.
 *
 * Usage:
 *   npx tsx scripts/create-historical-gpu-prices.ts
 */

import { config } from "dotenv"
import postgres from "postgres"

config({ path: ".env.local" })

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set")
}

const sql = postgres(process.env.DATABASE_URL)

async function main() {
  console.log("Creating historical GPU price index entries...\n")

  try {
    // Step 1: Extract quarterly pricing data
    console.log("Step 1: Extracting quarterly pricing data from cloud_instances...")
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
      console.log("No historical proof data found. Exiting.")
      await sql.end()
      return
    }

    console.log(`Found ${quarterlyData.length} quarters with proof data:\n`)

    // Display what will be created
    quarterlyData.forEach((quarter) => {
      // Use earliest_proof to avoid timezone issues
      const date = new Date(quarter.earliest_proof)
      const quarterNum = Math.floor(date.getUTCMonth() / 3) + 1
      const year = date.getUTCFullYear()
      console.log(`  Q${quarterNum} ${year}:`)
      console.log(`    - Proofs: ${quarter.proof_count}`)
      console.log(
        `    - Avg per-GPU price: $${Number(quarter.avg_per_gpu_price).toFixed(6)}/hour`
      )
      console.log(
        `    - Date range: ${new Date(quarter.earliest_proof).toLocaleDateString()} - ${new Date(quarter.latest_proof).toLocaleDateString()}`
      )
      console.log("")
    })

    // Step 2: Insert into gpu_price_index
    console.log("Step 2: Creating gpu_price_index entries...")

    for (const quarter of quarterlyData) {
      // Use earliest_proof to avoid timezone issues
      const date = new Date(quarter.earliest_proof)
      const quarterNum = Math.floor(date.getUTCMonth() / 3) + 1
      const year = date.getUTCFullYear()
      const gpuName = `Historical Q${quarterNum} ${year}`

      // Use the actual quarter start for created_at (first day of quarter in UTC)
      const quarterStartMonth = (quarterNum - 1) * 3
      const createdAt = new Date(Date.UTC(year, quarterStartMonth, 1))

      await sql`
        INSERT INTO gpu_price_index (gpu_name, hourly_price, created_at)
        VALUES (
          ${gpuName},
          ${quarter.avg_per_gpu_price},
          ${createdAt}
        )
        ON CONFLICT DO NOTHING
      `

      console.log(`  ✓ Created: ${gpuName}`)
    }

    // Step 3: Verify what was created
    console.log("\nStep 3: Verifying created entries...")
    const created = await sql`
      SELECT
        id,
        gpu_name,
        hourly_price,
        created_at
      FROM gpu_price_index
      WHERE gpu_name LIKE 'Historical%'
      ORDER BY created_at ASC
    `

    console.log(`\nCreated ${created.length} historical price index entries:\n`)
    created.forEach((entry) => {
      console.log(`  ID ${entry.id}: ${entry.gpu_name}`)
      console.log(`    - Price: $${Number(entry.hourly_price).toFixed(6)}/hour`)
      console.log(`    - Date: ${new Date(entry.created_at).toISOString()}`)
      console.log("")
    })

    console.log("✅ Done! You can now run migration 0042_drop-machines.sql")
    console.log(
      "   The backfill in that migration will link proofs to these quarterly prices.\n"
    )
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
