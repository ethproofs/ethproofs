import { NextRequest, NextResponse } from "next/server"

import { fetchReliabilityDailyStats } from "@/lib/api/metrics"

const MAX_DAYS = 90

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const rawDays = Number(searchParams.get("days"))
  const parsedDays = Number.isFinite(rawDays) ? Math.floor(rawDays) : 30
  const days = Math.max(1, Math.min(parsedDays, MAX_DAYS))

  const data = await fetchReliabilityDailyStats(days)
  return NextResponse.json(data)
}
