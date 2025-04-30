import { desc } from "drizzle-orm"

import { db } from "@/db"
import { zkvmVersions } from "@/db/schema"

export async function getZkvms({ limit }: { limit?: number } = {}) {
  const zkvms = await db.query.zkvms.findMany({
    with: {
      versions: {
        orderBy: desc(zkvmVersions.release_date),
      },
      vendor: true,
    },
    limit,
  })
  return zkvms
}
