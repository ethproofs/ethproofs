import { and, eq } from "drizzle-orm"

import { db } from "@/db"
import { zkvmVersions } from "@/db/schema"

export async function getZkvmVersion(id: number) {
  const zkvmVersion = await db.query.zkvmVersions.findFirst({
    where: (zkvmVersions, { eq }) => eq(zkvmVersions.id, id),
  })
  return zkvmVersion
}

export async function getZkvmVersionByVersion(zkvmId: number, version: string) {
  const zkvmVersion = await db.query.zkvmVersions.findFirst({
    where: and(
      eq(zkvmVersions.zkvm_id, zkvmId),
      eq(zkvmVersions.version, version)
    ),
  })
  return zkvmVersion ?? null
}

export async function createZkvmVersion(zkvmId: number, version: string) {
  const [inserted] = await db
    .insert(zkvmVersions)
    .values({
      zkvm_id: zkvmId,
      version,
    })
    .onConflictDoNothing()
    .returning()

  if (inserted) return inserted

  const existing = await getZkvmVersionByVersion(zkvmId, version)
  if (!existing) throw new Error("failed to create or find zkvm version")
  return existing
}
