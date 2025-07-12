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
  context: z.infer<typeof routeContextSchema>
) {
  try {
    const { params } = routeContextSchema.parse(context)
    const blockNumber = parseInt(params.block, 10)

    if (isNaN(blockNumber)) {
      return new Response("Invalid block number", { status: 400 })
    }

    const block = await fetchBlock({ blockNumber })

    if (!block) {
      return new Response("Block not found", { status: 404 })
    }

    const prover_performance: Record<string, any> = {}

    const proofs = block.proofs

    for (const proof of proofs) {
      if (!proof.team) continue
      const teamSlug = proof.team.slug
      // If we already have a proof for this team, skip.
      // This is a simplification, as a team could have multiple proofs.
      if (prover_performance[teamSlug]) {
        continue
      }

      const cost = getProvingCost(proof)

      prover_performance[teamSlug] = {
        proof_time_s: proof.proving_time ? proof.proving_time / 1000 : null,
        cost_usd: cost,
        cycles: proof.proving_cycles,
        status: proof.proof_status,
      }
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