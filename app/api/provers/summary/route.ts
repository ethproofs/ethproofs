import { NextResponse } from "next/server"

import { fetchProverSummary } from "@/lib/api/provers-metrics"

export async function GET() {
  const data = await fetchProverSummary()
  return NextResponse.json(data)
}
