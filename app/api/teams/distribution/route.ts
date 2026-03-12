import { NextResponse } from "next/server"

import { fetchTeamContributions } from "@/lib/api/teams-metrics"

export async function GET() {
  const data = await fetchTeamContributions()
  return NextResponse.json(data)
}
