import { NextRequest, NextResponse } from "next/server"

import { CHART_RANGES } from "@/lib/constants"

import { fetchProofsDailyStats } from "@/lib/api/stats"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const days = Math.max(Number(searchParams.get("days")), ...CHART_RANGES)

  const data = await fetchProofsDailyStats(days)
  return NextResponse.json(data)
}
