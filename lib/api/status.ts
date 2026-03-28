import { and, eq, gte, inArray, lt, notExists, sql } from "drizzle-orm"
import { unstable_cache as cache } from "next/cache"

import { TAGS } from "../constants"

import { db } from "@/db"
import {
  blocks,
  clusters,
  clusterVersions,
  proofs,
  proverTypes,
  teams,
} from "@/db/schema"

export interface MissingProofCluster {
  cluster_id: string
  cluster_name: string
  cluster_id_suffix: string
  missing_blocks: number[]
}

export interface MissingProofTeam {
  team_id: string
  team_name: string
  team_slug: string
  clusters: MissingProofCluster[]
}

export interface PerfectCluster {
  cluster_id: string
  cluster_name: string
  cluster_id_suffix: string
  team_name: string
  team_slug: string
}

export interface ProverTypeGroup {
  prover_type_id: number
  prover_type_name: string
  teams: MissingProofTeam[]
}

export interface PerfectProverTypeGroup {
  prover_type_id: number
  prover_type_name: string
  clusters: PerfectCluster[]
}

export interface MultiClusterMiss {
  block_number: number
  clusters_missing: number
  cluster_names: string[]
}

export interface MissingProofsStatus {
  date: string
  total_missing: number
  missing_by_prover_type: ProverTypeGroup[]
  perfect_by_prover_type: PerfectProverTypeGroup[]
  multi_cluster_misses: MultiClusterMiss[]
  checked_at: string
  total_active_clusters: number
  total_blocks_monitored: number
  monitored_block_numbers: number[]
  missing_block_range: {
    start: number | null
    end: number | null
  }
  total_block_range: {
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
  const now = new Date()
  const hoursBack = daysBack === 0 ? 6 : daysBack * 24

  const BUCKET_MS = 5 * 60 * 1000
  const endTime = new Date(Math.floor(now.getTime() / BUCKET_MS) * BUCKET_MS)
  const startTime = new Date(endTime.getTime() - hoursBack * 60 * 60 * 1000)

  return cache(
    async (startTime: Date, endTime: Date) => {
      const missingProofsData = await db
        .select({
          team_id: teams.id,
          team_name: teams.name,
          team_slug: teams.slug,
          cluster_id: clusters.id,
          cluster_name: clusters.name,
          cluster_id_suffix: sql<string>`RIGHT(${clusters.id}::text, 6)`,
          block_number: blocks.block_number,
          block_timestamp: blocks.timestamp,
          prover_type_id: proverTypes.id,
          prover_type_name: proverTypes.name,
        })
        .from(blocks)
        .innerJoin(
          clusters,
          and(eq(clusters.is_active, true), eq(clusters.is_approved, true))
        )
        .innerJoin(teams, eq(teams.id, clusters.team_id))
        .innerJoin(proverTypes, eq(proverTypes.id, clusters.prover_type_id))
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
                    inArray(proofs.proof_status, ["proved", "error"])
                  )
                )
            )
          )
        )
        .orderBy(blocks.block_number)

      const activeClustersData = await db
        .select({
          cluster_id: clusters.id,
          cluster_name: clusters.name,
          cluster_id_suffix: sql<string>`RIGHT(${clusters.id}::text, 6)`,
          team_name: teams.name,
          team_slug: teams.slug,
          prover_type_id: proverTypes.id,
          prover_type_name: proverTypes.name,
        })
        .from(clusters)
        .innerJoin(teams, eq(teams.id, clusters.team_id))
        .innerJoin(proverTypes, eq(proverTypes.id, clusters.prover_type_id))
        .where(
          and(eq(clusters.is_active, true), eq(clusters.is_approved, true))
        )

      const totalBlocksData = await db
        .select({
          block_number: blocks.block_number,
        })
        .from(blocks)
        .where(
          and(
            gte(blocks.timestamp, startTime.toISOString()),
            lt(blocks.timestamp, endTime.toISOString()),
            sql`${blocks.block_number} % 100 = 0`
          )
        )
        .orderBy(blocks.block_number)

      const missingBlockNumbers = missingProofsData.map((row) =>
        Number(row.block_number)
      )
      const totalBlockNumbers = totalBlocksData.map((row) =>
        Number(row.block_number)
      )

      const missingBlockRange = {
        start:
          missingBlockNumbers.length > 0
            ? Math.min(...missingBlockNumbers)
            : null,
        end:
          missingBlockNumbers.length > 0
            ? Math.max(...missingBlockNumbers)
            : null,
      }

      const totalBlockRange = {
        start:
          totalBlockNumbers.length > 0 ? Math.min(...totalBlockNumbers) : null,
        end:
          totalBlockNumbers.length > 0 ? Math.max(...totalBlockNumbers) : null,
      }

      const missingClusterIds = new Set(
        missingProofsData.map((row) => row.cluster_id)
      )

      const proverTypeMap = new Map<number, ProverTypeGroup>()

      for (const row of missingProofsData) {
        if (!proverTypeMap.has(row.prover_type_id)) {
          proverTypeMap.set(row.prover_type_id, {
            prover_type_id: row.prover_type_id,
            prover_type_name: row.prover_type_name,
            teams: [],
          })
        }

        const proverTypeGroup = proverTypeMap.get(row.prover_type_id)
        if (!proverTypeGroup) continue

        let team = proverTypeGroup.teams.find((t) => t.team_id === row.team_id)
        if (!team) {
          team = {
            team_id: row.team_id,
            team_name: row.team_name,
            team_slug: row.team_slug,
            clusters: [],
          }
          proverTypeGroup.teams.push(team)
        }

        let cluster = team.clusters.find((c) => c.cluster_id === row.cluster_id)
        if (!cluster) {
          cluster = {
            cluster_id: row.cluster_id,
            cluster_name: row.cluster_name,
            cluster_id_suffix: row.cluster_id_suffix,
            missing_blocks: [],
          }
          team.clusters.push(cluster)
        }

        cluster.missing_blocks.push(Number(row.block_number))
      }

      for (const group of proverTypeMap.values()) {
        for (const team of group.teams) {
          for (const cluster of team.clusters) {
            cluster.missing_blocks.sort((a, b) => a - b)
          }
        }
      }

      const perfectMap = new Map<number, PerfectProverTypeGroup>()

      for (const row of activeClustersData) {
        if (missingClusterIds.has(row.cluster_id)) continue

        if (!perfectMap.has(row.prover_type_id)) {
          perfectMap.set(row.prover_type_id, {
            prover_type_id: row.prover_type_id,
            prover_type_name: row.prover_type_name,
            clusters: [],
          })
        }

        const group = perfectMap.get(row.prover_type_id)
        if (!group) continue

        group.clusters.push({
          cluster_id: row.cluster_id,
          cluster_name: row.cluster_name,
          cluster_id_suffix: row.cluster_id_suffix,
          team_name: row.team_name,
          team_slug: row.team_slug,
        })
      }

      const multiClusterThreshold = 3
      const blockClusterMap = new Map<number, Map<string, string>>()
      for (const row of missingProofsData) {
        const blockNum = Number(row.block_number)
        const existing = blockClusterMap.get(blockNum)
        if (existing) {
          existing.set(row.cluster_id, row.cluster_name)
        } else {
          blockClusterMap.set(
            blockNum,
            new Map([[row.cluster_id, row.cluster_name]])
          )
        }
      }

      const multiClusterMisses: MultiClusterMiss[] = []
      for (const [blockNumber, clusterEntries] of blockClusterMap) {
        if (clusterEntries.size >= multiClusterThreshold) {
          multiClusterMisses.push({
            block_number: blockNumber,
            clusters_missing: clusterEntries.size,
            cluster_names: Array.from(clusterEntries.values()),
          })
        }
      }
      multiClusterMisses.sort((a, b) => b.clusters_missing - a.clusters_missing)

      return {
        date: startTime.toISOString().split("T")[0],
        total_missing: missingProofsData.length,
        missing_by_prover_type: Array.from(proverTypeMap.values()),
        perfect_by_prover_type: Array.from(perfectMap.values()),
        multi_cluster_misses: multiClusterMisses,
        checked_at: new Date().toISOString(),
        total_active_clusters: activeClustersData.length,
        total_blocks_monitored: totalBlockNumbers.length,
        monitored_block_numbers: totalBlockNumbers.sort((a, b) => a - b),
        missing_block_range: missingBlockRange,
        total_block_range: totalBlockRange,
        time_range: {
          start: startTime.toISOString(),
          end: endTime.toISOString(),
        },
      }
    },
    [
      `missing-proofs-status:v2:days=${daysBack}:hours=${hoursBack}:end=${endTime.toISOString()}`,
      startTime.toISOString(),
      endTime.toISOString(),
    ],
    {
      revalidate: 60 * 60 * 3,
      tags: [TAGS.PROOFS, TAGS.BLOCKS, TAGS.CLUSTERS, TAGS.TEAMS],
    }
  )(startTime, endTime)
}
