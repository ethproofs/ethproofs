import { NextResponse } from "next/server"
import { z } from "zod"

import { fetchBlock } from "@/lib/api/blocks"
import { getProvingCost } from "@/lib/proofs"
import { ProofWithCluster } from "@/lib/types"

const routeContextSchema = z.object({
  params: z.object({
    block: z.string(),
  }),
})

export async function GET(
  req: Request,
  context: { params: Promise<{ block: string }> }
) {
  try {
    const params = await context.params
    const { params: validatedParams } = routeContextSchema.parse({ params })
    const blockNumber = parseInt(validatedParams.block, 10)

    if (isNaN(blockNumber)) {
      return new Response("Invalid block number", { status: 400 })
    }

    const block = await fetchBlock({ blockNumber })

    if (!block) {
      return new Response("Block not found", { status: 404 })
    }

    const prover_performance: Record<string, any[]> = {}

    const proofs = block.proofs

    for (const proof of proofs) {
      if (!proof.team) continue
      const teamSlug = proof.team.slug
      
      // Initialize array for team if it doesn't exist
      if (!prover_performance[teamSlug]) {
        prover_performance[teamSlug] = []
      }

      const cost = getProvingCost(proof)

      // Add this proof to the team's array
      prover_performance[teamSlug].push({
        proof_id: proof.proof_id,
        proof_time_s: proof.proving_time ? proof.proving_time / 1000 : null,
        cost_usd: cost,
        cycles: proof.proving_cycles,
        status: proof.proof_status,
        created_at: proof.created_at,
      })
    }

    const response = {
      block_number: block.block_number,
      prover_performance,
    }

    return NextResponse.json(response)
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify(error.issues), { status: 422 })
    }

    console.error(error)
    return new Response("Internal Server Error", { status: 500 })
  }
} 