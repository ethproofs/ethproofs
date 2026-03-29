import type { SQL } from "drizzle-orm"
import { sql } from "drizzle-orm"

import { db } from "@/db"
import { downtimeIncidents } from "@/db/schema"

export function downtimeBlockExclusion(blockNumberRef: SQL): SQL {
  return sql`NOT EXISTS (
    SELECT 1 FROM ${downtimeIncidents}
    WHERE ${blockNumberRef} BETWEEN ${downtimeIncidents.start_block} AND ${downtimeIncidents.end_block}
  )`
}

export const DOWNTIME_BLOCK_EXCLUSION_SQL = sql.raw(
  `NOT EXISTS (
    SELECT 1 FROM downtime_incidents di
    WHERE b.block_number BETWEEN di.start_block AND di.end_block
  )`
)

export function downtimeBlockExclusionFor(blockRef: string): SQL {
  return sql.raw(
    `NOT EXISTS (
    SELECT 1 FROM downtime_incidents di
    WHERE ${blockRef} BETWEEN di.start_block AND di.end_block
  )`
  )
}

export async function fetchDowntimeIncidents() {
  return db.query.downtimeIncidents.findMany({
    orderBy: (table, { desc }) => [desc(table.created_at)],
  })
}
