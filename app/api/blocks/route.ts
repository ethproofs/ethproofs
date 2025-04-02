import type { NextRequest } from "next/server"

import { DEFAULT_PAGE_SIZE } from "@/lib/constants"

import { fetchBlocksPaginated } from "@/lib/api/blocks"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  const pageIndex = Number(searchParams.get("page_index"))
  const pageSize = Number(searchParams.get("page_size"))

  if (isNaN(pageIndex) || isNaN(pageSize)) {
    return new Response("Invalid page index or page size", { status: 400 })
  }

  try {
    const blocks = await fetchBlocksPaginated({
      pageIndex,
      pageSize: Math.min(pageSize, DEFAULT_PAGE_SIZE),
    })

    return Response.json(blocks)
  } catch (error) {
    console.error("Error fetching blocks", error)
    return new Response("Internal server error", { status: 500 })
  }
}
