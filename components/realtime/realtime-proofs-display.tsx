"use client"

import { useMemo } from "react"
import { AnimatePresence, motion } from "framer-motion"

import type { ProofWithCluster } from "@/lib/types"

import EthproofsIcon from "@/components/svgs/ethproofs-icon.svg"

import { HidePunctuation } from "../StylePunctuation"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Spinner } from "../ui/spinner"

import { ProofItem } from "./proof-item"

import { useBlocksQuery } from "@/lib/hooks/queries/use-blocks-query"
import useRealtimeBlockProofs from "@/lib/hooks/realtime/use-realtime-block-proofs"
import { formatNumber } from "@/lib/number"

export function RealtimeProofsDisplay() {
  useRealtimeBlockProofs()
  const { data, isLoading, error } = useBlocksQuery({
    pageIndex: 0,
    pageSize: 10,
    machineType: "all",
  })

  // Get all blocks sorted newest first
  const blocksSorted = useMemo(() => {
    return (data?.rows ?? []).sort((a, b) => b.block_number - a.block_number)
  }, [data?.rows])

  // Determine which blocks to display
  // Always show the first 3 blocks (newest first)
  const blocksToDisplay = useMemo(() => {
    return blocksSorted.slice(0, 3)
  }, [blocksSorted])

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
        <EthproofsIcon className="size-8" />
        <span className="text-xl">realtime proofs</span>
      </div>
      <AnimatePresence mode="popLayout">
        {blocksToDisplay.map((block) => {
          const proofs = block.proofs ?? []
          if (proofs.length === 0) return null

          return (
            <motion.div
              key={block.block_number}
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
                    <HidePunctuation>
                      {formatNumber(block.block_number)}
                    </HidePunctuation>
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
