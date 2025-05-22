import { db } from "@/db"

export const getZkvmVersion = async (id: number) => {
  const zkvmVersion = await db.query.zkvmVersions.findFirst({
    where: (zkvmVersions, { eq }) => eq(zkvmVersions.id, id),
  })
  return zkvmVersion
}
