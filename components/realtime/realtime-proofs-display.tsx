"use client"

import { useRef } from "react"

import type { ProofWithCluster } from "@/lib/types"

import { useRealtimeProofsQuery } from "@/components/realtime/use-realtime-proofs-query"

import { HidePunctuation } from "../StylePunctuation"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"

import { ProofItem } from "./proof-item"
import useRealtimeProofs from "./use-realtime-proofs"

import { formatNumber } from "@/lib/number"

const TIMEOUT_MS = 1 * 60 * 1000 // 1 minutes

export function RealtimeProofsDisplay() {
  // Use real-time subscription to invalidate cache
  useRealtimeProofs()

  const { data: proofsByBlock, isLoading, error } = useRealtimeProofsQuery()
  const completionTimesRef = useRef(new Map<number, number>())

  // Get all block numbers sorted newest first
  const blockNumbers = proofsByBlock
    ? Object.keys(proofsByBlock)
        .map(Number)
        .sort((a, b) => b - a)
    : []

  // Determine which blocks to display
  // Show newest block + any older blocks still within timeout
  const blocksToDisplay: number[] = []
  const now = Date.now()

  for (const blockNum of blockNumbers) {
    if (blocksToDisplay.length === 0) {
      // Always show the newest block
      blocksToDisplay.push(blockNum)
    } else {
      // For older blocks, show if still in progress or recently completed
      const completedAt = completionTimesRef.current.get(blockNum)
      if (!completedAt) {
        // Still in progress, show it
        blocksToDisplay.push(blockNum)
      } else {
        // Completed, check if within timeout
        const elapsed = now - completedAt
        if (elapsed < TIMEOUT_MS) {
          blocksToDisplay.push(blockNum)
        }
      }
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">loading proofs...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <p className="text-destructive">
          error loading proofs: {error.message}
        </p>
      </div>
    )
  }

  if (blocksToDisplay.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">no active proofs</p>
      </div>
    )
  }

  return (
    <div className="w-full space-y-4">
      <span className="text-xl">realtime proofs</span>
      {blocksToDisplay.map((blockNum) => {
        const proofs = proofsByBlock[blockNum]
        const allProved = proofs.every(
          (p: ProofWithCluster) => p.proof_status === "proved"
        )

        let completedAt = completionTimesRef.current.get(blockNum)

        // Set completion timestamp if all proofs just became proved
        if (allProved && !completedAt) {
          completedAt = Date.now()
          completionTimesRef.current.set(blockNum, completedAt)
        }

        return (
          <Card key={blockNum} className="rounded-lg border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-normal">
                  <HidePunctuation>{formatNumber(blockNum)}</HidePunctuation>
                </CardTitle>
                {allProved && completedAt && (
                  <span className="text-sm text-muted-foreground">
                    clearing in{" "}
                    {Math.ceil(
                      (TIMEOUT_MS - (Date.now() - completedAt)) / 1000
                    )}
                    s
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {proofs.map((proof: ProofWithCluster) => (
                <ProofItem key={proof.proof_id} proof={proof} />
              ))}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
