import { NextRequest, NextResponse } from "next/server"

import { fetchRtpCohortConsistency } from "@/lib/api/provers-metrics"

const MAX_DAYS = 730

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const rawDays = Number(searchParams.get("days"))
  const parsedDays = Number.isFinite(rawDays) ? Math.floor(rawDays) : 364
  const days = Math.max(1, Math.min(parsedDays, MAX_DAYS))

  const data = await fetchRtpCohortConsistency(days)
  return NextResponse.json(data)
}
