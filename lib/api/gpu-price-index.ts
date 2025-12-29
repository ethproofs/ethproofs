import { desc } from "drizzle-orm"

import { db } from "@/db"
import { gpuPriceIndex } from "@/db/schema"

/**
 * Gets the most recent GPU price index entry (including id)
 * Used when creating new proofs to snapshot the price at time of proving
 */
export const getLatestGpuPriceIndex = async () => {
  const latestPriceIndex = await db.query.gpuPriceIndex.findFirst({
    orderBy: desc(gpuPriceIndex.created_at),
    columns: {
      id: true,
      hourly_price: true,
    },
  })

  return latestPriceIndex ?? null
}
