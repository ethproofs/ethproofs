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

  // if the query is not a hash or a block number, return null
  if (!isHash(query) && !Number.isInteger(Number(query))) {
    return Response.json(null)
  }

  // Build query based on whether query is a hash or block number
  const isBlockNumber = !isHash(query) && Number.isInteger(Number(query))
  
  const result = await db
    .select({
      block: blocks,
      proof: proofs,
    })
    .from(blocks)
    .innerJoin(proofs, eq(blocks.block_number, proofs.block_number))
    .where(isBlockNumber ? eq(blocks.block_number, Number(query)) : eq(blocks.hash, query))

  if (!result.length) {
    return Response.json(null)
  }

  const block = {
    ...result[0].block,
    proofs: result.map((r) => r.proof),
  }

  return Response.json(block)
}
