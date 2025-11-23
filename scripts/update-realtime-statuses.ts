import { config } from "dotenv"
import postgres from "postgres"
import { drizzle } from "drizzle-orm/postgres-js"
import { eq, and, inArray } from "drizzle-orm"
import * as schema from "../db/schema"

config({ path: ".env.local" })

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set")
}

const client = postgres(process.env.DATABASE_URL, {
  prepare: false,
  max: 3,
})

const db = drizzle({
  client,
  schema,
  casing: "snake_case",
})

// Status flow that proofs go through (all states)
const statusFlow = [
  "queued",
  "proving",
  "proved",
  "downloading", // fetching proof
  "success", // verified
] as const

type Status = (typeof statusFlow)[number]

// Base time in milliseconds each status should last
// Actual duration will be randomized between base and base * 1.5
const baseStatusDurations: Record<Status, number> = {
  queued: 2000, // 2-3 seconds
  proving: 5000, // 5-7.5 seconds
  proved: 2000, // 2-3 seconds
  downloading: 3000, // 3-4.5 seconds (fetching proof)
  success: 3000, // 3-4.5 seconds (verified) before restarting
}

// Get randomized duration for a status
function getRandomDuration(status: Status): number {
  const base = baseStatusDurations[status]
  const min = base
  const max = base * 1.5
  return Math.floor(Math.random() * (max - min) + min)
}

async function updateProofStatuses() {
  console.log("🔄 Starting real-time status updates...")
  console.log("Press Ctrl+C to stop\n")

  // Check if new columns exist
  let hasNewColumns = false
  try {
    const result = await client`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'clusters' 
      AND column_name IN ('deployment_type', 'gpu_count')
    `
    hasNewColumns = Array.isArray(result) && result.length === 2
  } catch {
    hasNewColumns = false
  }

  try {
    while (true) {
      // Get all proofs
      const allProofs = await db.query.proofs.findMany({
        where: (proofs, { inArray }) =>
          inArray(proofs.proof_status, [
            "queued",
            "proving",
            "proved",
            "downloading",
            "success",
          ]),
        orderBy: (proofs, { asc }) => [asc(proofs.proof_id)],
        limit: 100,
      })

      if (allProofs.length === 0) {
        console.log("⚠️  No proofs found. Run seed script first.")
        await new Promise((resolve) => setTimeout(resolve, 5000))
        continue
      }

      // Track when each proof was last updated to respect status durations
      const now = Date.now()
      
      for (const proof of allProofs) {
        const currentStatus = proof.proof_status as Status
        const currentIndex = statusFlow.indexOf(currentStatus)

        if (currentIndex === -1) continue

        // Check if enough time has passed for this status
        const lastUpdate = new Date(proof.updated_at).getTime()
        const timeInStatus = now - lastUpdate
        
        // Use proof_id as seed for consistent randomization per proof
        // This makes each proof have its own "speed" but consistent behavior
        const seed = proof.proof_id
        const random = ((seed * 9301 + 49297) % 233280) / 233280
        
        // Each proof has a speed multiplier (0.7x to 1.5x) for variety
        const speedMultiplier = 0.7 + random * 0.8
        
        const baseDuration = baseStatusDurations[currentStatus]
        const minDuration = baseDuration * 0.7 // Can be faster
        const maxDuration = baseDuration * 1.8 // Can be slower
        const requiredDuration = Math.floor(
          minDuration + (random * (maxDuration - minDuration)) * speedMultiplier
        )

        // Only update if enough time has passed
        // Add some randomness: 15% chance to skip this cycle even if time has passed
        // This creates more natural, less synchronized updates
        if (timeInStatus < requiredDuration || Math.random() < 0.15) {
          continue
        }

        // Determine next status
        let nextStatus: Status
        let nextIndex: number

        if (currentIndex === statusFlow.length - 1) {
          // If at the end (success/verified), restart from beginning (queued)
          nextIndex = 0
          nextStatus = statusFlow[0]
        } else {
          // Move to next status
          nextIndex = currentIndex + 1
          nextStatus = statusFlow[nextIndex]
        }

        // Update timestamps based on status
        const nowISO = new Date().toISOString()
        const updates: Partial<typeof proof> = {
          proof_status: nextStatus,
          updated_at: nowISO,
        }

        if (nextStatus === "proving" && !proof.proving_timestamp) {
          updates.proving_timestamp = nowISO
        }

        if (nextStatus === "proved" && !proof.proved_timestamp) {
          updates.proved_timestamp = nowISO
        }

        // Reset timestamps when restarting from success to queued
        if (nextStatus === "queued" && currentStatus === "success") {
          updates.queued_timestamp = nowISO
          updates.proving_timestamp = null
          updates.proved_timestamp = null
        }

        // Update the proof
        await db
          .update(schema.proofs)
          .set(updates)
          .where(eq(schema.proofs.proof_id, proof.proof_id))

        // Get cluster info - use SQL direct if new columns don't exist to avoid schema mismatch
        let clusterNickname: string | null = null
        if (!hasNewColumns) {
          const clusterResult = await client`
            SELECT nickname FROM clusters WHERE id = ${proof.cluster_id}::uuid
          `
          clusterNickname = clusterResult[0]?.nickname || null
        } else {
          const cluster = await db.query.clusters.findFirst({
            where: (clusters, { eq }) => eq(clusters.id, proof.cluster_id),
          })
          clusterNickname = cluster?.nickname || null
        }

        console.log(
          `✅ ${clusterNickname || proof.cluster_id}: ${currentStatus} → ${nextStatus}`
        )
      }

      // Wait before next update cycle (check every 500ms for faster updates)
      const waitTime = 500
      await new Promise((resolve) => setTimeout(resolve, waitTime))
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("canceling")) {
      console.log("\n👋 Stopped updating statuses")
    } else {
      console.error("❌ Error updating statuses:", error)
    }
  } finally {
    await client.end()
  }
}

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n👋 Shutting down...")
  process.exit(0)
})

process.on("SIGTERM", () => {
  console.log("\n👋 Shutting down...")
  process.exit(0)
})

updateProofStatuses()

