import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"

import type { ProofWithCluster } from "@/lib/types"

import type { ProofsByBlock } from "./use-realtime-proofs-query"

import { createClient } from "@/utils/supabase/client"

// Subscribe to real-time updates for proofs and update cache directly
const useRealtimeProofs = () => {
  const queryClient = useQueryClient()

  useEffect(() => {
    const supabase = createClient()

    const proofsChannel = supabase
      .channel("proofs")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "proofs" },
        (payload) => {
          // For INSERT events, try to update cache if proof data is available
          // If proof not in cache or missing relations, fallback to refetch
          const newProof = payload.new as Partial<ProofWithCluster>

          if (!newProof.proof_id || !newProof.block_number) {
            // Missing required fields, fallback to refetch
            queryClient.invalidateQueries({ queryKey: ["proofs-by-block"] })
            return
          }

          // Check if proof already exists in cache
          const currentData = queryClient.getQueryData<ProofsByBlock>([
            "proofs-by-block",
          ])

          if (!currentData) {
            // Cache not initialized, refetch
            queryClient.invalidateQueries({ queryKey: ["proofs-by-block"] })
            return
          }

          // Check if proof already exists in cache
          const blockNumber = newProof.block_number
          const existingProof = currentData[blockNumber]?.find(
            (p) => p.proof_id === newProof.proof_id
          )

          if (existingProof) {
            // Proof already in cache, update it
            const updatedProof: ProofWithCluster = {
              ...existingProof,
              ...newProof,
            }

            queryClient.setQueryData<ProofsByBlock>(
              ["proofs-by-block"],
              (oldData) => {
                if (!oldData) return oldData

                const updated = { ...oldData }
                if (!updated[blockNumber]) {
                  updated[blockNumber] = []
                }

                const proofIndex = updated[blockNumber].findIndex(
                  (p) => p.proof_id === newProof.proof_id
                )

                if (proofIndex >= 0) {
                  updated[blockNumber][proofIndex] = updatedProof
                } else {
                  updated[blockNumber].push(updatedProof)
                }

                // Sort proofs by created_at to maintain order
                updated[blockNumber].sort(
                  (a, b) =>
                    new Date(a.created_at).getTime() -
                    new Date(b.created_at).getTime()
                )

                return updated
              }
            )
          } else {
            // Proof not in cache, need relations - fallback to refetch
            queryClient.invalidateQueries({ queryKey: ["proofs-by-block"] })
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "proofs" },
        (payload) => {
          // For UPDATE events, merge payload with existing cached proof
          const updatedProofData = payload.new as Partial<ProofWithCluster>

          if (!updatedProofData.proof_id || !updatedProofData.block_number) {
            // Missing required fields, fallback to refetch
            queryClient.invalidateQueries({ queryKey: ["proofs-by-block"] })
            return
          }

          // Check if cache is initialized and proof exists before updating
          const currentData = queryClient.getQueryData<ProofsByBlock>([
            "proofs-by-block",
          ])

          if (!currentData) {
            // Cache not initialized, refetch
            queryClient.invalidateQueries({ queryKey: ["proofs-by-block"] })
            return
          }

          const blockNumber = updatedProofData.block_number!
          const blockProofs = currentData[blockNumber]

          if (!blockProofs) {
            // Block not in cache, refetch
            queryClient.invalidateQueries({ queryKey: ["proofs-by-block"] })
            return
          }

          const proofIndex = blockProofs.findIndex(
            (p) => p.proof_id === updatedProofData.proof_id
          )

          if (proofIndex < 0) {
            // Proof not found in cache, refetch
            queryClient.invalidateQueries({ queryKey: ["proofs-by-block"] })
            return
          }

          // Merge payload fields with existing proof (preserving relations)
          const existingProof = blockProofs[proofIndex]
          const updatedProof: ProofWithCluster = {
            ...existingProof,
            ...updatedProofData,
            // Preserve relations that come from API, not websocket payload
            cluster_version: existingProof.cluster_version,
            block: existingProof.block,
            team: existingProof.team,
          }

          // Update the cache directly
          queryClient.setQueryData<ProofsByBlock>(
            ["proofs-by-block"],
            (oldData) => {
              if (!oldData) return oldData

              const updated = { ...oldData }
              updated[blockNumber] = [...blockProofs]
              updated[blockNumber][proofIndex] = updatedProof

              // Sort proofs by created_at to maintain order
              updated[blockNumber].sort(
                (a, b) =>
                  new Date(a.created_at).getTime() -
                  new Date(b.created_at).getTime()
              )

              return updated
            }
          )
        }
      )
      .subscribe()

    const blocksChannel = supabase
      .channel("blocks")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "blocks" },
        () => {
          // For new blocks, we need to refetch to get proofs with relations
          queryClient.invalidateQueries({ queryKey: ["proofs-by-block"] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(proofsChannel)
      supabase.removeChannel(blocksChannel)
    }
  }, [queryClient])
}

export default useRealtimeProofs
