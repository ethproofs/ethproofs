import { NextResponse } from "next/server"

import { fetchTeamsTableData } from "@/lib/api/teams-metrics"

export async function GET() {
  const data = await fetchTeamsTableData()
  return NextResponse.json(data)
}
