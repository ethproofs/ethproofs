import { z } from "zod"

import { getInstances } from "@/lib/api/cloud-instances"
import { logger } from "@/lib/logger"
import { cloudInstancesQuerySchema } from "@/lib/zod/schemas/cloud-instance"

export const dynamic = "force-dynamic"

export const GET = async (request: Request) => {
  const { searchParams } = new URL(request.url)
  const provider = searchParams.get("provider")

  try {
    const query = cloudInstancesQuerySchema.parse({
      provider: provider || undefined,
    })

    const data = await getInstances(query.provider)

    return Response.json(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid query parameters", { status: 400 })
    }
    logger.error("Failed to fetch cloud instances", error, {
      provider,
    })
    return new Response("Internal server error", { status: 500 })
  }
}
