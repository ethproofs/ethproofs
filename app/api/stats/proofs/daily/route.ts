import { NextRequest, NextResponse } from "next/server"

import { CHART_RANGES } from "@/lib/constants"

import { fetchProofsDailyStats } from "@/lib/api/stats"

const MAX_DAYS = Math.max(...CHART_RANGES)

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const days = Math.min(Number(searchParams.get("days")), MAX_DAYS)

  const data = await fetchProofsDailyStats(days)
  return NextResponse.json(data)
}
