import type { NextRequest } from "next/server"

import { DEFAULT_PAGE_SIZE } from "@/lib/constants"

import { fetchTeamProofsPaginated } from "@/lib/api/proofs"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await params

  if (!teamId) {
    return new Response("Invalid team ID", { status: 400 })
  }

  const searchParams = request.nextUrl.searchParams

  const pageIndex = Number(searchParams.get("page_index"))
  const pageSize = Number(searchParams.get("page_size"))

  if (isNaN(pageIndex) || isNaN(pageSize)) {
    return new Response("Invalid page index or page size", { status: 400 })
  }

  try {
    const proofs = await fetchTeamProofsPaginated(teamId, {
      pageIndex,
      pageSize: Math.max(pageSize, DEFAULT_PAGE_SIZE),
    })

    return Response.json(proofs)
  } catch (error) {
    console.error("Error fetching proofs", error)
    return new Response("Internal server error", { status: 500 })
  }
}
