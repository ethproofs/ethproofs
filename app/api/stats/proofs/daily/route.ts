import { NextRequest, NextResponse } from "next/server"

import { CHART_RANGES } from "@/lib/constants"

import { fetchProofsDailyStats } from "@/lib/api/stats"

const MAX_DAYS = Math.max(...CHART_RANGES)

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const rawDays = Number(searchParams.get("days"))
  const defaultDays = Math.max(...CHART_RANGES)
  const parsedDays = Number.isFinite(rawDays) ? Math.floor(rawDays) : defaultDays
  const days = Math.max(0, Math.min(parsedDays, MAX_DAYS))

  const data = await fetchProofsDailyStats(days)
  return NextResponse.json(data)
}
