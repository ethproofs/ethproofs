import type { NextRequest } from "next/server"

import { fetchBlock } from "@/lib/api/blocks"
import { isBlockHash } from "@/lib/blocks"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ blockId: string }> }
) {
  const { blockId } = await params

  if (!isBlockHash(blockId) && isNaN(Number(blockId))) {
    return new Response("Invalid block id", { status: 400 })
  }

  try {
    const block = await fetchBlock(
      isBlockHash(blockId)
        ? { hash: blockId }
        : { blockNumber: Number(blockId) }
    )

    if (!block) {
      return new Response("Block not found", { status: 404 })
    }

    return Response.json(block)
  } catch (error) {
    console.error("Error fetching block", error)
    return new Response("Internal server error", { status: 500 })
  }
}
