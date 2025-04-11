import { sql } from "drizzle-orm"
import { eq } from "drizzle-orm"

import { getTeam } from "./teams"

import { db } from "@/db"
import { proofs } from "@/db/schema"

const getStorageQuota = async (id: string) => {
  const team = await getTeam(id)
  return team?.storage_quota_bytes
}

const currentStorageUsage = async (id: string) => {
  const currentUsage = await db
    .select({
      total: sql<number>`COALESCE(SUM(${proofs.size_bytes}), 0)`,
    })
    .from(proofs)
    .where(eq(proofs.team_id, id))

  return Number(currentUsage[0]?.total || 0)
}

export const isStorageQuotaExceeded = async (
  id: string,
  sizeBytes: number = 0
) => {
  const storageQuota = await getStorageQuota(id)

  // empty storage quota means no quota, so we can upload
  if (!storageQuota) {
    return false
  }

  const currentUsage = await currentStorageUsage(id)
  return currentUsage + sizeBytes > storageQuota
}
