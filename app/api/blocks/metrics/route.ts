import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

import {
  fetchBlocksChartData,
  fetchRecentBlocksSummary,
} from "@/lib/api/blocks-metrics"

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get("type")

  try {
    if (type === "recent") {
      const data = await fetchRecentBlocksSummary()
      return NextResponse.json(data)
    }

    if (type === "charts") {
      const data = await fetchBlocksChartData()
      return NextResponse.json(data)
    }

    return new Response("Invalid type parameter. Use 'recent' or 'charts'.", {
      status: 400,
    })
  } catch (error) {
    console.error("Error fetching blocks metrics:", error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
