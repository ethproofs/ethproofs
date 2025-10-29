import { NextResponse } from "next/server"
import { z } from "zod"

import { fetchProofsFiltered } from "@/lib/api/proofs"

const querySchema = z.object({
  block: z.string().optional(),
  cluster_ids: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(1000).default(100),
  offset: z.coerce.number().int().min(0).default(0),
})

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const query = {
      block: searchParams.get("block") || undefined,
      cluster_ids: searchParams.get("cluster_ids") || undefined,
      limit: searchParams.get("limit") || undefined,
      offset: searchParams.get("offset") || undefined,
    }

    const validatedQuery = querySchema.parse(query)

    // Parse cluster_ids comma-separated string into array
    const clusterIds = validatedQuery.cluster_ids
      ? validatedQuery.cluster_ids.split(",").map((id) => id.trim())
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
}
