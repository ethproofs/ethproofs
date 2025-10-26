import { NextResponse } from "next/server"
import { z } from "zod"

import { fetchProofsFiltered } from "@/lib/api/proofs"

const querySchema = z.object({
  block: z.string().optional(),
  team: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(1000).default(100),
  offset: z.coerce.number().int().min(0).default(0),
})

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const query = {
      block: searchParams.get("block") || undefined,
      team: searchParams.get("team") || undefined,
      limit: searchParams.get("limit") || undefined,
      offset: searchParams.get("offset") || undefined,
    }

    const validatedQuery = querySchema.parse(query)

    const result = await fetchProofsFiltered({
      teamSlug: validatedQuery.team,
      block: validatedQuery.block,
      limit: validatedQuery.limit,
      offset: validatedQuery.offset,
    })

    // Just return the proof
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
