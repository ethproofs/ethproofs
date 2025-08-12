import { z } from "zod"

import { getInstances } from "@/lib/api/cloud-instances"
import { cloudInstancesQuerySchema } from "@/lib/zod/schemas/cloud-instance"

export const dynamic = "force-dynamic"

export const GET = async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url)
    const provider = searchParams.get("provider")
    const query = cloudInstancesQuerySchema.parse({
      provider: provider || undefined,
    })

    const data = await getInstances(query.provider)

    return Response.json(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid query parameters", { status: 400 })
    }
    console.error("error fetching cloud instances", error)
    return new Response("Internal server error", { status: 500 })
  }
}
