import { db } from "@/db"

export const getBenchmarks = async () => {
  const data = await db.query.benchmarks.findMany()

  return data
}
