"use client"

import { useQuery } from "@tanstack/react-query"

import type { ProofWithCluster } from "@/lib/types"

export interface ProofsByBlock {
  [blockNumber: number]: ProofWithCluster[]
}

export function useRealtimeProofsQuery() {
  return useQuery({
    queryKey: ["proofs-by-block"],
    queryFn: async () => {
      console.log("[Query] Fetching proofs-by-block", new Date().toISOString())
      const response = await fetch("/api/realtime/proofs")
      if (!response.ok) {
        throw new Error("Failed to fetch realtime proofs")
      }

      const { proofs } = await response.json()
      console.log("[Query] Got proofs, count:", proofs.length)

      // Group proofs by block_number
      const grouped = (proofs || []).reduce(
        (acc: ProofsByBlock, proof: ProofWithCluster) => {
          const blockNum = proof.block_number
          if (!acc[blockNum]) {
            acc[blockNum] = []
          }
          acc[blockNum].push(proof)
          return acc
        },
        {} as ProofsByBlock
      )

      console.log("[Query] Grouped into blocks:", Object.keys(grouped).length)
      return grouped
    },
    staleTime: Infinity, // Data is kept fresh by websocket invalidations
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  })
}
