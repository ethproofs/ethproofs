"use client"

import { useMemo } from "react"
import { AnimatePresence, motion } from "framer-motion"

import type { ProofWithCluster } from "@/lib/types"

import { useRealtimeProofsQuery } from "@/components/realtime/use-realtime-proofs-query"
import EthproofsIcon from "@/components/svgs/ethproofs-icon.svg"

import { HidePunctuation } from "../StylePunctuation"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Spinner } from "../ui/spinner"

import { ProofItem } from "./proof-item"
import useRealtimeProofs from "./use-realtime-proofs"

import { formatNumber } from "@/lib/number"

export function RealtimeProofsDisplay() {
  // Use real-time subscription to invalidate cache
  useRealtimeProofs()

  const { data: proofsByBlock, isLoading, error } = useRealtimeProofsQuery()

  // Get all block numbers sorted newest first
  const blockNumbers = useMemo(
    () =>
      proofsByBlock
        ? Object.keys(proofsByBlock)
            .map(Number)
            .sort((a, b) => b - a)
        : [],
    [proofsByBlock]
  )

  // Determine which blocks to display
  // Always show the first 3 blocks (newest first)
  const blocksToDisplay: number[] = useMemo(() => {
    return blockNumbers.slice(0, 3)
  }, [blockNumbers])

  if (isLoading) {
    return (
      <div className="mt-4 flex items-center justify-center gap-2">
        <Spinner className="text-muted-foreground" />
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
      <div className="flex items-center">
        <EthproofsIcon className="h-12 w-12" />
        <span className="text-xl">realtime proofs</span>
      </div>
      <AnimatePresence mode="popLayout">
        {blocksToDisplay.map((blockNum) => {
          const proofs = proofsByBlock?.[blockNum]
          if (!proofs) return null

          return (
            <motion.div
              key={blockNum}
              layout
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              style={{ position: "relative" }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-normal">
                    <HidePunctuation>{formatNumber(blockNum)}</HidePunctuation>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {proofs.map((proof: ProofWithCluster) => (
                    <ProofItem key={proof.proof_id} proof={proof} />
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
