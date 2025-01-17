import { eq } from "drizzle-orm"
import { NextRequest } from "next/server"
import { isHash } from "viem"

import { db } from "@/db"
import { blocks, proofs } from "@/db/schema"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  const query = searchParams.get("query")

  if (!query) {
    return new Response("query search param is required", { status: 400 })
  }

  const result = await db
    .select({
      block: blocks,
      proof: proofs,
    })
    .from(blocks)
    .innerJoin(proofs, eq(blocks.block_number, proofs.block_number))
    .where(eq(isHash(query) ? blocks.hash : blocks.block_number, query))

  if (!result.length) {
    return Response.json(null)
  }

  const block = {
    ...result[0].block,
    proofs: result.map((r) => r.proof),
  }

  return Response.json(block)
}
