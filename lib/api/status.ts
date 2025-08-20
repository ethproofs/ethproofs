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
}

export const fetchMissingProofsStatus = async (
  daysBack: number = 1
): Promise<MissingProofsStatus> => {
  const targetDate = new Date()
  // TODO: Check status more frequently
  targetDate.setDate(targetDate.getDate() - daysBack)
  const startOfDay = new Date(
    targetDate.getFullYear(),
    targetDate.getMonth(),
    targetDate.getDate()
  )
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)

  return cache(
    async (startOfDay: Date, endOfDay: Date) => {
      // Find all missing proofs for the target date
      const missingProofsData = await db
        .select({
          team_id: teams.id,
          team_name: teams.name,
          cluster_id: clusters.id,
          cluster_nickname: clusters.nickname,
          cluster_id_suffix: sql<string>`RIGHT(${clusters.id}::text, 6)`,
          block_number: blocks.block_number,
        })
        .from(blocks)
        .innerJoin(clusters, and(eq(clusters.is_active, true)))
        .innerJoin(teams, eq(teams.id, clusters.team_id))
        .where(
          and(
            gte(blocks.timestamp, startOfDay.toISOString()),
            lt(blocks.timestamp, endOfDay.toISOString()),
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
        date: startOfDay.toISOString().split("T")[0],
        total_missing: missingProofsData.length,
        teams: Array.from(teamsMap.values()),
      }
    },
    [
      `missing-proofs-status-${daysBack}`,
      startOfDay.toISOString(),
      endOfDay.toISOString(),
    ],
    {
      // revalidate: 60 * 60, // 1 hour
      revalidate: 60 * 60 * 24, // daily
      tags: [TAGS.PROOFS, TAGS.BLOCKS],
    }
  )(startOfDay, endOfDay)
}
