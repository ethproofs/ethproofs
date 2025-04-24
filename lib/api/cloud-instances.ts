import { eq } from "drizzle-orm"
import { unstable_cache as cache } from "next/cache"

import { db } from "@/db"
import { cloudProviders } from "@/db/schema"

export const getInstances = cache(
  async (provider?: string) => {
    const data = await db.query.cloudInstances.findMany({
      with: {
        provider: true,
      },
      where: provider
        ? (instances) =>
            eq(
              instances.provider_id,
              db
                .select({ id: cloudProviders.id })
                .from(cloudProviders)
                .where(eq(cloudProviders.name, provider))
                .limit(1)
            )
        : undefined,
    })

    return data
  },
  ["cloud-instances"],
  {
    revalidate: false,
  }
)
