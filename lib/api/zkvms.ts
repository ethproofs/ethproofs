import { desc, eq } from "drizzle-orm"
import { unstable_cache as cache } from "next/cache"

import { db } from "@/db"
import { zkvms, zkvmVersions } from "@/db/schema"

export const getZkvms = cache(async ({ limit }: { limit?: number } = {}) => {
  const zkvms = await db.query.zkvms.findMany({
    with: {
      versions: {
        orderBy: desc(zkvmVersions.release_date),
      },
      team: true,
    },
    limit,
  })
  return zkvms
})

export const getZkvm = cache(
  async ({ id, slug }: { id?: number; slug?: string }) => {
    const filter = id
      ? eq(zkvms.id, id)
      : slug
        ? eq(zkvms.slug, slug)
        : undefined

    if (!filter) {
      throw new Error("Either id or slug must be provided")
    }

    const zkvm = await db.query.zkvms.findFirst({
      where: () => filter,
      with: {
        versions: {
          orderBy: desc(zkvmVersions.release_date),
        },
        team: true,
      },
    })
    return zkvm
  }
)

export const getZkvmsByTeamId = async (teamId: string) => {
  const zkvms = await db.query.zkvms.findMany({
    where: (zkvms, { eq }) => eq(zkvms.team_id, teamId),
  })
  return zkvms
}
