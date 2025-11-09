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
      const response = await fetch("/api/realtime/proofs")
      if (!response.ok) {
        throw new Error("Failed to fetch realtime proofs")
      }

      const { proofs } = await response.json()

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

      return grouped
    },
    refetchInterval: 100, // Poll every 100ms to catch rapid state changes
    refetchIntervalInBackground: true, // Continue polling even when tab is not focused
    staleTime: 0, // Always fresh since we're using real-time
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  })
}
