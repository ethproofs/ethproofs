/**
 * Backfill gpu_price_index_id for existing proofs
 *
 * Updates proofs to link them to the appropriate gpu_price_index entry
 * based on their proved_timestamp.
 *
 * This is the same backfill logic from migration 0042, but as a standalone script
 * so you can re-run it after manually creating gpu_price_index entries.
 *
 * Usage:
 *   npx tsx scripts/backfill-proof-prices.ts
 */

import { config } from "dotenv"
import postgres from "postgres"

config({ path: ".env.local" })

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set")
}

const sql = postgres(process.env.DATABASE_URL)

async function main() {
  console.log("Backfilling gpu_price_index_id for proofs...\n")

  try {
    // First, show available gpu_price_index entries
    const priceEntries = await sql`
      SELECT id, gpu_name, hourly_price, created_at
      FROM gpu_price_index
      ORDER BY created_at ASC
    `

    console.log(`Found ${priceEntries.length} gpu_price_index entries:\n`)
    priceEntries.forEach((entry) => {
      console.log(`  ID ${entry.id}: ${entry.gpu_name}`)
      console.log(`    Price: $${Number(entry.hourly_price).toFixed(6)}/hour`)
      console.log(`    Date: ${new Date(entry.created_at).toISOString()}`)
      console.log("")
    })

    // Count proofs that need updating
    const [{ count: totalProofs }] = await sql`
      SELECT COUNT(*) as count
      FROM proofs
      WHERE proof_status = 'proved'
    `

    console.log(`Total proved proofs: ${totalProofs}\n`)

    // Run the backfill (updates ALL proofs, not just NULL ones)
    console.log("Running backfill (will update ALL proofs)...\n")

    const result = await sql`
      UPDATE proofs p
      SET gpu_price_index_id = COALESCE(
        (
          SELECT gpi.id
          FROM gpu_price_index gpi
          WHERE gpi.created_at <= COALESCE(p.proved_timestamp, p.created_at)
          ORDER BY gpi.created_at DESC
          LIMIT 1
        ),
        1 -- Fallback to first price index entry for historical proofs
      )
      WHERE p.proof_status = 'proved'
    `

    console.log(`✅ Updated ${result.count} proofs\n`)

    // Show distribution of proofs across price entries
    console.log("Distribution of proofs across gpu_price_index entries:\n")
    const distribution = await sql`
      SELECT
        gpi.id,
        gpi.gpu_name,
        gpi.hourly_price,
        COUNT(p.proof_id) as proof_count
      FROM gpu_price_index gpi
      LEFT JOIN proofs p ON p.gpu_price_index_id = gpi.id
      GROUP BY gpi.id, gpi.gpu_name, gpi.hourly_price
      ORDER BY gpi.created_at ASC
    `

    distribution.forEach((entry) => {
      console.log(`  ${entry.gpu_name}: ${entry.proof_count} proofs`)
    })

    console.log("\n✅ Backfill complete!")
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
