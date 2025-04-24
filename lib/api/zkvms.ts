import { db } from "@/db"

export async function getZkvms() {
  const zkvms = await db.query.zkvms.findMany({
    with: {
      versions: true,
      vendor: true,
    },
  })
  return zkvms
}
