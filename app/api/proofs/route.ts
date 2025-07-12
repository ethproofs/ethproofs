import type { NextRequest } from "next/server"

import { fetchProofsFiltered } from "@/lib/api/proofs"
import { getProvingCost } from "@/lib/proofs"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  const teamSlug = searchParams.get("team") || undefined
  const blockParam = searchParams.get("block")
  const limit = Number(searchParams.get("limit") || "100")
  const offset = Number(searchParams.get("offset") || "0")

  const blockNumber = blockParam ? parseInt(blockParam, 10) : undefined

  if (blockParam && isNaN(blockNumber!)) {
    return new Response("Invalid block number", { status: 400 })
  }

  if (isNaN(limit) || isNaN(offset)) {
    return new Response("Invalid limit or offset", { status: 400 })
  }

  try {
    const { rows, rowCount } = await fetchProofsFiltered({
      teamSlug,
      blockNumber,
      limit,
      offset,
    })

    // Transform the data
    const transformedProofs = rows.map((proof) => {
      const cost = proof.cluster_version ? getProvingCost(proof as any) : null

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
      limit,
      offset,
    })
  } catch (error) {
    console.error("Error fetching proofs:", error)
    return new Response("Internal server error", { status: 500 })
  }
} 