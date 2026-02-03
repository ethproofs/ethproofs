"use client"

import { useMemo } from "react"

import type { Block } from "@/lib/types"

import { cn } from "@/lib/utils"

import { HidePunctuation } from "../StylePunctuation"
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card"

import { RealtimeProofRow } from "./realtime-proof-row"

import { formatNumber } from "@/lib/number"

interface RealtimeBlockCardProps {
  block: Block
}

export function RealtimeBlockCard({ block }: RealtimeBlockCardProps) {
  const proofs = useMemo(() => block.proofs ?? [], [block.proofs])

  const sortedProofs = useMemo(() => {
    const statusOrder: Record<string, number> = {
      proved: 0,
      verifying: 1,
      downloading: 2,
      proving: 3,
      queued: 4,
    }
    return [...proofs].sort((a, b) => {
      const aOrder = statusOrder[a.proof_status] ?? 5
      const bOrder = statusOrder[b.proof_status] ?? 5
      return aOrder - bOrder
    })
  }, [proofs])

  const verifiedCount = useMemo(
    () => proofs.filter((p) => p.proof_status === "proved").length,
    [proofs]
  )

  return (
    <Card className="bg-sidebar transition-all">
      <CardHeader className="flex flex-row items-center justify-between px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="text-sm tracking-wide">
            <HidePunctuation>
              {formatNumber(block.block_number)}
            </HidePunctuation>
          </span>
        </div>
      </CardHeader>

      <CardContent className="mb-2 space-y-1 px-3 py-2">
        {sortedProofs.map((proof) => (
          <RealtimeProofRow key={proof.proof_id} proof={proof} />
        ))}
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t px-3 py-2 text-xs text-muted-foreground">
        <span>{proofs.length} provers racing</span>
        <span>{verifiedCount} verified</span>
      </CardFooter>
    </Card>
  )
}
