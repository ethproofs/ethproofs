import type { NextRequest } from "next/server"

import { DEFAULT_FETCH_LIMIT } from "@/lib/constants"

import { fetchProvedProofsByClusterId } from "@/lib/api/proofs"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clusterId: string }> }
) {
  const { clusterId } = await params
  const searchParams = request.nextUrl.searchParams

  const pageIndex = Number(searchParams.get("page_index"))
  const pageSize = Number(searchParams.get("page_size"))

  if (isNaN(pageIndex) || isNaN(pageSize)) {
    return new Response("Invalid page index or page size", { status: 400 })
  }

  try {
    const proofs = await fetchProvedProofsByClusterId(
      clusterId,
      {
        pageIndex,
        pageSize,
      },
      DEFAULT_FETCH_LIMIT
    )

    // Map to include block data at top level for consistency
    const mappedProofs = proofs.rows.map((proof) => ({
      ...proof,
      block: {
        block_number: proof.block?.block_number,
        timestamp: proof.block?.timestamp,
      },
    }))

    return Response.json({
      rows: mappedProofs,
      rowCount: proofs.rowCount,
    })
  } catch (error) {
    console.error("Error fetching proofs for cluster", error)
    return new Response("Internal server error", { status: 500 })
  }
}
