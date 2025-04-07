import { and, eq, SQL } from "drizzle-orm"

import { CloudInstance } from "../types"

import { db } from "@/db"
import { cloudInstances } from "@/db/schema"

export const getInstances = async (provider?: CloudInstance["provider"]) => {
  const filters: SQL[] = []
  if (provider) {
    filters.push(eq(cloudInstances.provider, provider))
  }

  const data = await db.query.cloudInstances.findMany({
    where: and(...filters),
  })

  return data
}
