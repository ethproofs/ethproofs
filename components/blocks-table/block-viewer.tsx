"use client"

import { useState } from "react"
import { Clock, Cpu, Hourglass, Layers, Timer } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { Row } from "@tanstack/react-table"

import { Block } from "@/lib/types"

import { truncateHash } from "@/lib/utils"

import { BLOCK_GAS_LIMIT } from "@/lib/constants"

import { CopyButton } from "../CopyButton"
import { DataTableRowViewer } from "../data-table/data-table-row-viewer"
import Null from "../Null"
import ProofStatus, { ProofStatusInfo } from "../ProofStatus"
import { HidePunctuation } from "../StylePunctuation"
import Timestamp from "../Timestamp"
import { Button } from "../ui/button"
import { Card, CardHeader, CardTitle } from "../ui/card"
import { Separator } from "../ui/separator"

import { timestampToEpoch, timestampToSlot } from "@/lib/beaconchain"
import { formatTimeAgo } from "@/lib/date"
import { formatNumber } from "@/lib/number"
import { getProofsPerStatusCount } from "@/lib/proofs"

interface BlockViewerProps {
  row: Row<Block>
}
export function BlockViewer({ row }: BlockViewerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const blockNumber = row.getValue("block_number") as number
  const formattedBlockNumber = formatNumber(blockNumber)

  const {
    data: block,
    isLoading,
    error,
  } = useQuery<Block>({
    enabled: isOpen,
    queryKey: ["block", blockNumber],
    queryFn: async () => {
      const res = await fetch(`/api/blocks/${blockNumber}`)
      if (!res.ok) throw new Error("Failed to fetch block")
      return res.json()
    },
    initialData: row.original, // Use table data for instant display
    staleTime: 0, // Always refetch to ensure fresh data
  })

  const timestamp = block.timestamp
  const formattedTimestamp = timestamp
    ? formatTimeAgo(new Date(timestamp))
    : "in progress"

  const trigger = (
    <Button
      variant="link"
      className="inline w-fit p-0 text-left text-sm tracking-wide"
    >
      <HidePunctuation className="text-primary">
        {formattedBlockNumber}
      </HidePunctuation>
      <div className="text-xs text-muted-foreground">{formattedTimestamp}</div>
    </Button>
  )

  // Handle loading and error states
  if (isLoading) return <div>Updating block...</div>
  if (error) return <div>Error loading block: {error.message}</div>

  const proofsPerStatusCount = getProofsPerStatusCount(block.proofs)

  return (
    <DataTableRowViewer
      trigger={trigger}
      onOpenChange={(value: boolean) => setIsOpen(value)}
      title="block"
      description={
        <>
          <div className="inline text-lg text-primary">
            <HidePunctuation>{formattedBlockNumber}</HidePunctuation>
          </div>
          <div className="flex items-center gap-2">
            <span>{truncateHash(block.hash ?? "", 15, 15)}</span>
            {block.hash ? <CopyButton message={block.hash} /> : <Null />}
          </div>
        </>
      }
    >
      <div className="flex min-h-0 flex-1 flex-col gap-1 text-sm">
        <div className="p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="size-4" /> timestamp
            </div>
            {timestamp ? <Timestamp>{timestamp}</Timestamp> : <Null />}
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Cpu className="size-4" /> gas used
            </div>
            <div className="inline">
              {block.gas_used ? (
                <>
                  <HidePunctuation>
                    {formatNumber(block.gas_used)}
                  </HidePunctuation>
                  {" / "}
                  <HidePunctuation>
                    {formatNumber(BLOCK_GAS_LIMIT)}
                  </HidePunctuation>
                </>
              ) : (
                <Null />
              )}
            </div>
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Layers className="size-4" /> slot
            </div>
            <div className="inline">
              {timestamp ? (
                <HidePunctuation>
                  {formatNumber(timestampToSlot(timestamp))}
                </HidePunctuation>
              ) : (
                <Null />
              )}
            </div>
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Hourglass className="size-4" /> epoch
            </div>
            <div className="inline">
              {timestamp ? (
                <HidePunctuation>
                  {formatNumber(timestampToEpoch(timestamp))}
                </HidePunctuation>
              ) : (
                <Null />
              )}
            </div>
          </div>
        </div>
        <Separator />
        <div className="flex flex-col gap-4 p-4">
          <div className="flex items-center gap-4">
            <div className="text-base font-semibold">proof availability</div>
            <ProofStatus statusCount={proofsPerStatusCount} />
          </div>
          <div className="text-center text-sm text-primary sm:text-start">
            1x4090 performance
          </div>
        </div>
      </div>
    </DataTableRowViewer>
  )
}
