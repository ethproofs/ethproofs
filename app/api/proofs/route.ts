import type { NextRequest } from "next/server"
import { z } from "zod"

import { fetchProofsFiltered } from "@/lib/api/proofs"
import { getProvingCost } from "@/lib/proofs"
import { ProofWithCluster } from "@/lib/types"

const queryParamsSchema = z.object({
  team: z.string().optional(),
  block: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(1000).default(100),
  offset: z.coerce.number().int().min(0).default(0),
})

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  try {
    // Parse and validate query parameters
    const params = queryParamsSchema.parse({
      team: searchParams.get("team") || undefined,
      block: searchParams.get("block") || undefined,
      limit: searchParams.get("limit") || undefined,
      offset: searchParams.get("offset") || undefined,
    })

    const { rows, rowCount } = await fetchProofsFiltered({
      teamSlug: params.team,
      blockNumber: params.block,
      limit: params.limit,
      offset: params.offset,
    })

    // Transform the data
    const transformedProofs = rows.map((proof) => {
      const cost = proof.cluster_version ? getProvingCost(proof as ProofWithCluster) : null

      return {
        proof_id: proof.proof_id,
        block_number: proof.block_number,
        status: proof.proof_status,
        proving_time_s: proof.proving_time ? proof.proving_time / 1000 : null,
        cost_usd: cost,
        cycles: proof.proving_cycles,
        team: proof.team
          ? {
              slug: proof.team.slug,
              name: proof.team.name,
            }
          : null,
        cluster: proof.cluster_version?.cluster
          ? {
              id: proof.cluster_version.cluster.id,
              name: proof.cluster_version.cluster.nickname,
              is_multi_machine: proof.cluster_version.cluster.is_multi_machine,
            }
          : null,
        zkvm: proof.cluster_version?.zkvm_version?.zkvm
          ? {
              name: proof.cluster_version.zkvm_version.zkvm.name,
              version: proof.cluster_version.zkvm_version.version,
            }
          : null,
        timestamps: {
          created: proof.created_at,
          queued: proof.queued_timestamp,
          proving: proof.proving_timestamp,
          proved: proof.proved_timestamp,
        },
      }
    })

    return Response.json({
      proofs: transformedProofs,
      total: rowCount,
      limit: params.limit,
      offset: params.offset,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify(error.issues), { status: 422 })
    }
    
    console.error("Error fetching proofs:", error)
    return new Response("Internal server error", { status: 500 })
  }
} 