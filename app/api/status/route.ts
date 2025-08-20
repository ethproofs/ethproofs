import { NextRequest, NextResponse } from "next/server"

import { fetchMissingProofsStatus } from "@/lib/api/status"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const daysBack = parseInt(searchParams.get("days") || "1", 10)

    if (daysBack < 1 || daysBack > 30) {
      return NextResponse.json(
        { error: "Days parameter must be between 1 and 30" },
        { status: 400 }
      )
    }

    const statusData = await fetchMissingProofsStatus(daysBack)

    return NextResponse.json(statusData)
  } catch (error) {
    console.error("Error fetching missing proofs status:", error)
    return NextResponse.json(
      { error: "Failed to fetch status data" },
      { status: 500 }
    )
  }
}
