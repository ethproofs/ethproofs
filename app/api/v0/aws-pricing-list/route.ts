import { db } from "@/db"

export const GET = async () => {
  try {
    const data = await db.query.awsInstancePricing.findMany()
    return Response.json(data)
  } catch (error) {
    console.error("error fetching aws pricing list", error)
    return new Response("Internal server error", { status: 500 })
  }
}
