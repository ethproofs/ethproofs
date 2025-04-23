import { and, eq, SQL } from "drizzle-orm"
import { unstable_cache as cache } from "next/cache"

import { db } from "@/db"
import { cloudProviders } from "@/db/schema"

export const getInstances = cache(
  async (provider?: string) => {
    const filters: SQL[] = []
    if (provider) {
      filters.push(eq(cloudProviders.name, provider))
    }

    const data = await db.query.cloudInstances.findMany({
      where: and(...filters),
      with: {
        provider: true,
      },
    })

    return data
  },
  ["cloud-instances"],
  {
    revalidate: false,
  }
)
