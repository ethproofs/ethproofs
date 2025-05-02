import { db } from "@/db"

export const getVendorByUserId = async (userId: string) => {
  const vendor = await db.query.vendors.findFirst({
    where: (vendors, { eq }) => eq(vendors.user_id, userId),
  })
  return vendor
}
