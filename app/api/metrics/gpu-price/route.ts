import { NextRequest, NextResponse } from "next/server"

import { fetchGpuPriceHistory } from "@/lib/api/metrics"

const MAX_WEEKS = 52

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const rawWeeks = Number(searchParams.get("weeks"))
  const parsedWeeks = Number.isFinite(rawWeeks) ? Math.floor(rawWeeks) : 32
  const weeks = Math.max(1, Math.min(parsedWeeks, MAX_WEEKS))

  const data = await fetchGpuPriceHistory(weeks)
  return NextResponse.json(data)
}
