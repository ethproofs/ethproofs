import { z } from "zod"

import { db } from "@/db"
import { withAuthAndRateLimit } from "@/lib/middleware/with-rate-limit"

const queryParamsSchema = z.object({
  team_id: z.string().uuid(),
})

export const GET = withAuthAndRateLimit(async ({ apiKey, request }) => {
  // Restrict to admin mode
  if (apiKey?.mode !== "admin") {
    return new Response("Forbidden: admin mode required", { status: 403 })
  }

  try {
    const url = new URL(request.url)
    const queryParams = queryParamsSchema.parse({
      team_id: url.searchParams.get("team_id"),
    })

    const activeClusters = await db.query.clusters.findMany({
      columns: {
        index: true,
      },
      where: (cluster, { eq, and }) =>
        and(
          eq(cluster.team_id, queryParams.team_id),
          eq(cluster.is_active, true)
        ),
    })

    return Response.json(
      activeClusters.map(({ index }) => ({
        id: index,
      }))
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid query parameters", { status: 422 })
    }
    console.error("error fetching active clusters", error)
    return new Response("Internal server error", { status: 500 })
  }
})
