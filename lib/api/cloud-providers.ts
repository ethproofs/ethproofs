import { db } from "@/db"

export const getProviders = async () => {
  const providers = await db.query.cloudProviders.findMany()
  return providers
}
