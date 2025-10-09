import { NextRequest, NextResponse } from "next/server"

import { fetchBlock } from "@/lib/api/blocks"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ block: string }> }
) {
  try {
    const blockNumber = parseInt((await params).block)

    if (isNaN(blockNumber)) {
      return NextResponse.json(
        { error: "Invalid block number" },
        { status: 400 }
      )
    }

    const block = await fetchBlock({ blockNumber })

    if (!block) {
      return NextResponse.json({ error: "Block not found" }, { status: 404 })
    }

    return NextResponse.json(block)
  } catch (error) {
    console.error("Error fetching block:", error)
    return NextResponse.json(
      { error: "Failed to fetch block" },
      { status: 500 }
    )
  }
}
