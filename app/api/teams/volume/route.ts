import { NextResponse } from "next/server"

import { fetchProofVolumeByTeam } from "@/lib/api/teams-metrics"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const days = Number(searchParams.get("days")) || 7

  const data = await fetchProofVolumeByTeam(days)
  return NextResponse.json(data)
}
