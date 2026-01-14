import { eq, sql } from "drizzle-orm"
import { unstable_cache as cache } from "next/cache"

import { db } from "@/db"
import { clusters, guestPrograms } from "@/db/schema"

export const getGuestPrograms = cache(
  async ({ limit }: { limit?: number } = {}) => {
    const programs = await db.query.guestPrograms.findMany({
      limit,
    })
    return programs
  }
)

export const getGuestProgram = cache(async ({ id }: { id: number }) => {
  const program = await db.query.guestPrograms.findFirst({
    where: () => eq(guestPrograms.id, id),
  })
  return program
})

export interface GuestProgramWithUsage {
  id: number
  name: string
  language: string
  maintainer: string
  ecosystem: string
  license: string
  repo_url: string
  created_at: string
  totalClusters: number
  activeClusters: number
}

export const getGuestProgramsWithUsage = cache(
  async (): Promise<GuestProgramWithUsage[]> => {
    const programs = await db
      .select({
        id: guestPrograms.id,
        name: guestPrograms.name,
        language: guestPrograms.language,
        maintainer: guestPrograms.maintainer,
        ecosystem: guestPrograms.ecosystem,
        license: guestPrograms.license,
        repo_url: guestPrograms.repo_url,
        created_at: guestPrograms.created_at,
        totalClusters: sql<number>`count(${clusters.id})::int`,
        activeClusters: sql<number>`count(case when ${clusters.is_active} then 1 end)::int`,
      })
      .from(guestPrograms)
      .leftJoin(clusters, eq(clusters.guest_program_id, guestPrograms.id))
      .groupBy(guestPrograms.id)

    return programs
  }
)
