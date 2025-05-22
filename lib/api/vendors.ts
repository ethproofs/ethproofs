import { isUUID } from "../utils"

import { db } from "@/db"

export const getVendor = async (userId: string) => {
  const vendor = await db.query.vendors.findFirst({
    where: (vendors, { eq }) => eq(vendors.user_id, userId),
  })
  return vendor
}

export const getVendorBySlug = async (slug: string) => {
  const vendor = await db.query.vendors.findFirst({
    where: (vendors, { eq }) => eq(vendors.slug, slug),
  })
  return vendor
}
