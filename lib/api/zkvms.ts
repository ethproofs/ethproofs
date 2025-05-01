import { desc } from "drizzle-orm"
import { unstable_cache as cache } from "next/cache"

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

export const getZkvmBySlug = cache(async (slug: string) => {
  const zkvm = await db.query.zkvms.findFirst({
    where: (zkvms, { eq }) => eq(zkvms.slug, slug),
    with: {
      versions: {
        orderBy: desc(zkvmVersions.release_date),
      },
      vendor: true,
    },
  })
  return zkvm
})
