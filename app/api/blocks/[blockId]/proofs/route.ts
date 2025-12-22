import type { NextRequest } from "next/server"

import { DEFAULT_FETCH_LIMIT } from "@/lib/constants"

import { fetchBlock } from "@/lib/api/blocks"
import { isBlockHash } from "@/lib/blocks"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ blockId: string }> }
) {
  const { blockId } = await params
  const searchParams = request.nextUrl.searchParams

  const pageIndex = Number(searchParams.get("page_index"))
  const pageSize = Number(searchParams.get("page_size"))
  const filterType = searchParams.get("filter_type") || "all" // all, single, multi

  if (isNaN(pageIndex) || isNaN(pageSize)) {
    return new Response("Invalid page index or page size", { status: 400 })
  }

  if (!["all", "single", "multi"].includes(filterType)) {
    return new Response("Invalid filter type", { status: 400 })
  }

  try {
    const block = await fetchBlock(
      isBlockHash(blockId)
        ? { hash: blockId }
        : { blockNumber: parseInt(blockId, 10) }
    )

    if (!block) {
      return new Response("Block not found", { status: 404 })
    }

    let filteredProofs = block.proofs

    // Filter by machine type
    if (filterType === "single") {
      filteredProofs = filteredProofs.filter(
        (proof) => !proof.cluster_version?.cluster.is_multi_gpu
      )
    } else if (filterType === "multi") {
      filteredProofs = filteredProofs.filter(
        (proof) => proof.cluster_version?.cluster.is_multi_gpu
      )
    }

    const cappedProofs = filteredProofs.slice(0, DEFAULT_FETCH_LIMIT)

    // Apply pagination
    const start = pageIndex * pageSize
    const end = start + pageSize
    const paginatedProofs = cappedProofs.slice(start, end)

    // Map to include block data on proof object
    const mappedProofs = paginatedProofs.map((proof) => ({
      ...proof,
      block: {
        block_number: block.block_number,
        timestamp: block.timestamp,
      },
    }))

    return Response.json({
      rows: mappedProofs,
      rowCount: cappedProofs.length,
    })
  } catch (error) {
    console.error("Error fetching block proofs", error)
    return new Response("Internal server error", { status: 500 })
  }
}
