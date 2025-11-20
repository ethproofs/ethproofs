import { NextResponse } from "next/server"
import { z } from "zod"

import { fetchProofsFiltered } from "@/lib/api/proofs"
import { withAuthAndRateLimit } from "@/lib/middleware/with-rate-limit"

const querySchema = z.object({
  block: z.string().optional(),
  clusters: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(1000).default(100),
  offset: z.coerce.number().int().min(0).default(0),
})

// Rate limit: 30 requests per 60 seconds per API key
export const GET = withAuthAndRateLimit(
  async ({ request }) => {
    try {
      const { searchParams } = new URL(request.url)
      const query = {
        block: searchParams.get("block") || undefined,
        clusters: searchParams.get("clusters") || undefined,
        limit: searchParams.get("limit") || undefined,
        offset: searchParams.get("offset") || undefined,
      }

      const validatedQuery = querySchema.parse(query)

      // Parse clusters comma-separated string into array
      const clusterIds = validatedQuery.clusters
        ? validatedQuery.clusters.split(",").map((id) => id.trim())
        : undefined

      const result = await fetchProofsFiltered({
        block: validatedQuery.block,
        clusterIds,
        limit: validatedQuery.limit,
        offset: validatedQuery.offset,
      })

      return NextResponse.json({
        proofs: result.rows,
        total_count: result.rowCount,
        limit: validatedQuery.limit,
        offset: validatedQuery.offset,
      })
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(error.issues, { status: 422 })
      }

      console.error(error)
      return new Response("Internal Server Error", { status: 500 })
    }
  },
  { requests: 30, window: 60 }
)
