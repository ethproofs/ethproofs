import { and, eq, SQL } from "drizzle-orm"

import { InstanceType } from "../types"

import { db } from "@/db"
import { instanceTypes } from "@/db/schema"

export const getInstanceTypes = async (provider?: InstanceType["provider"]) => {
  const filters: SQL[] = []
  if (provider) {
    filters.push(eq(instanceTypes.provider, provider))
  }

  const data = await db.query.instanceTypes.findMany({
    where: and(...filters),
  })

  return data
}
