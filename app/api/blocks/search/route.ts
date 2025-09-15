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

  // Check if query is a valid block number (decimal only)
  const isBlockNumber = /^[0-9]+$/.test(query)
  
  // if the query is not a hash or a block number, return null
  if (!isHash(query) && !isBlockNumber) {
    return Response.json(null)
  }
  
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
