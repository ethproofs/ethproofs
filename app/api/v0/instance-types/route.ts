import { z } from "zod"

import { getInstanceTypes } from "@/lib/api/instance-types"
import { InstanceTypesQuerySchema } from "@/lib/zod/schemas/instance-types"

export const GET = async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url)
    const provider = searchParams.get("provider")
    const query = InstanceTypesQuerySchema.parse({
      provider: provider || undefined,
    })

    const data = await getInstanceTypes(query.provider)

    return Response.json(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid query parameters", { status: 400 })
    }
    console.error("error fetching instance types", error)
    return new Response("Internal server error", { status: 500 })
  }
}
