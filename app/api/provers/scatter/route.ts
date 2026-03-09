import { NextResponse } from "next/server"

import { fetchProverScatterData } from "@/lib/api/provers-metrics"

export async function GET() {
  const data = await fetchProverScatterData()
  return NextResponse.json(data)
}
