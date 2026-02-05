import { db } from "@/db"
import { zkvmVersions } from "@/db/schema"

export async function getZkvmVersion(id: number) {
  const zkvmVersion = await db.query.zkvmVersions.findFirst({
    where: (zkvmVersions, { eq }) => eq(zkvmVersions.id, id),
  })
  return zkvmVersion
}

export async function createZkvmVersion(zkvmId: number, version: string) {
  const [zkvmVersion] = await db
    .insert(zkvmVersions)
    .values({
      zkvm_id: zkvmId,
      version,
    })
    .returning()
  return zkvmVersion
}
