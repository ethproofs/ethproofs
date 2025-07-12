import { NextResponse } from "next/server"
import { z } from "zod"

import { fetchBlock } from "@/lib/api/blocks"

const routeContextSchema = z.object({
  params: z.object({
    block: z.coerce.number().int().positive(),
  }),
})

export async function GET(
  req: Request,
  context: { params: Promise<{ block: string }> }
) {
  try {
    const params = await context.params
    const { params: validatedParams } = routeContextSchema.parse({ params })

    const block = await fetchBlock({ blockNumber: validatedParams.block })

    if (!block) {
      return new Response("Block not found", { status: 404 })
    }

    // Return only block metadata
    const response = {
      block_number: block.block_number,
      timestamp: block.timestamp,
      gas_used: block.gas_used,
      transaction_count: block.transaction_count,
      hash: block.hash,
      created_at: block.created_at,
    }

    return NextResponse.json(response)
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify(error.issues), { status: 422 })
    }

    console.error(error)
    return new Response("Internal Server Error", { status: 500 })
  }
} 