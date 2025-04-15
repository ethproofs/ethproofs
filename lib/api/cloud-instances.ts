import { and, eq, SQL } from "drizzle-orm"
import { unstable_cache as cache } from "next/cache"

import { CloudInstance } from "../types"

import { db } from "@/db"
import { cloudInstances } from "@/db/schema"

export const getInstances = cache(
  async (provider?: CloudInstance["provider"]) => {
    const filters: SQL[] = []
    if (provider) {
      filters.push(eq(cloudInstances.provider, provider))
    }

    const data = await db.query.cloudInstances.findMany({
      where: and(...filters),
    })

    return data
  },
  ["cloud-instances"],
  {
    revalidate: false,
  }
)
