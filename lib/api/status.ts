import { and, eq, gte, lt, notExists, sql } from "drizzle-orm"
import { unstable_cache as cache } from "next/cache"

import { TAGS } from "../constants"

import { db } from "@/db"
import { blocks, clusters, clusterVersions, proofs, teams } from "@/db/schema"

export interface MissingProofCluster {
  cluster_id: string
  cluster_nickname: string
  cluster_id_suffix: string
  missing_blocks: number[]
}

export interface MissingProofTeam {
  team_id: string
  team_name: string
  clusters: MissingProofCluster[]
}

export interface MissingProofsStatus {
  date: string
  total_missing: number
  teams: MissingProofTeam[]
  checked_at: string
  block_range: {
    start: number | null
    end: number | null
  }
  time_range: {
    start: string
    end: string
  }
}

export const fetchMissingProofsStatus = async (
  daysBack: number = 0
): Promise<MissingProofsStatus> => {
  // Check the last 6 hours, or go back to specified days
  const now = new Date()
  const hoursBack = daysBack === 0 ? 6 : daysBack * 24

  // Bucket endTime to 5-minute windows for stable cache keys
  const BUCKET_MS = 5 * 60 * 1000
  const endTime = new Date(Math.floor(now.getTime() / BUCKET_MS) * BUCKET_MS)
  const startTime = new Date(endTime.getTime() - hoursBack * 60 * 60 * 1000)

  return cache(
    async (startTime: Date, endTime: Date) => {
      // Find all missing proofs for the time range
      const missingProofsData = await db
        .select({
          team_id: teams.id,
          team_name: teams.name,
          cluster_id: clusters.id,
          cluster_nickname: clusters.nickname,
          cluster_id_suffix: sql<string>`RIGHT(${clusters.id}::text, 6)`,
          block_number: blocks.block_number,
          block_timestamp: blocks.timestamp,
        })
        .from(blocks)
        .innerJoin(clusters, and(eq(clusters.is_active, true)))
        .innerJoin(teams, eq(teams.id, clusters.team_id))
        .where(
          and(
            gte(blocks.timestamp, startTime.toISOString()),
            lt(blocks.timestamp, endTime.toISOString()),
            sql`${blocks.block_number} % 100 = 0`,
            notExists(
              db
                .select({ id: proofs.proof_id })
                .from(proofs)
                .innerJoin(
                  clusterVersions,
                  eq(clusterVersions.id, proofs.cluster_version_id)
                )
                .where(
                  and(
                    eq(proofs.block_number, blocks.block_number),
                    eq(clusterVersions.cluster_id, clusters.id),
                    eq(proofs.proof_status, "proved")
                  )
                )
            )
          )
        )
        .orderBy(blocks.block_number)

      // Calculate block range for metadata
      const blockNumbers = missingProofsData.map((row) =>
        Number(row.block_number)
      )
      const blockRange = {
        start: blockNumbers.length > 0 ? Math.min(...blockNumbers) : null,
        end: blockNumbers.length > 0 ? Math.max(...blockNumbers) : null,
      }

      // Group data by team and cluster
      const teamsMap = new Map<string, MissingProofTeam>()

      for (const row of missingProofsData) {
        if (!teamsMap.has(row.team_id)) {
          teamsMap.set(row.team_id, {
            team_id: row.team_id,
            team_name: row.team_name,
            clusters: [],
          })
        }

        const team = teamsMap.get(row.team_id)!
        let cluster = team.clusters.find((c) => c.cluster_id === row.cluster_id)

        if (!cluster) {
          cluster = {
            cluster_id: row.cluster_id,
            cluster_nickname: row.cluster_nickname,
            cluster_id_suffix: row.cluster_id_suffix,
            missing_blocks: [],
          }
          team.clusters.push(cluster)
        }

        cluster.missing_blocks.push(Number(row.block_number))
      }

      // Sort missing blocks for each cluster
      for (const team of teamsMap.values()) {
        for (const cluster of team.clusters) {
          cluster.missing_blocks.sort((a, b) => a - b)
        }
      }

      return {
        date: startTime.toISOString().split("T")[0],
        total_missing: missingProofsData.length,
        teams: Array.from(teamsMap.values()),
        checked_at: new Date().toISOString(),
        block_range: blockRange,
        time_range: {
          start: startTime.toISOString(),
          end: endTime.toISOString(),
        },
      }
    },
    [
      `missing-proofs-status:v1:days=${daysBack}:hours=${hoursBack}:end=${endTime.toISOString()}`,
      startTime.toISOString(),
      endTime.toISOString(),
    ],
    {
      revalidate: 60 * 60 * 3, // 3 hours
      tags: [TAGS.PROOFS, TAGS.BLOCKS, TAGS.CLUSTERS, TAGS.TEAMS],
    }
  )(startTime, endTime)
}
