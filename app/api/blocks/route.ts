import type { NextRequest } from "next/server"

import { DEFAULT_PAGE_SIZE } from "@/lib/constants"

import { fetchBlocksPaginated, type MachineType } from "@/lib/api/blocks"
import { logger } from "@/lib/logger"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  const pageIndex = Number(searchParams.get("page_index"))
  const pageSize = Number(searchParams.get("page_size"))
  const machineType = (searchParams.get("machine_type") || "all") as MachineType

  if (isNaN(pageIndex) || isNaN(pageSize)) {
    return new Response("Invalid page index or page size", { status: 400 })
  }

  if (!["single", "multi", "all"].includes(machineType)) {
    return new Response("Invalid machine type", { status: 400 })
  }

  const log = logger.child({
    page_index: pageIndex,
    page_size: pageSize,
    machine_type: machineType,
  })

  try {
    const blocks = await fetchBlocksPaginated(
      {
        pageIndex,
        pageSize: Math.min(pageSize, DEFAULT_PAGE_SIZE),
      },
      machineType
    )

    return Response.json(blocks)
  } catch (error) {
    log.error({error},"Failed to fetch blocks")
    return new Response("Internal server error", { status: 500 })
  }
}
