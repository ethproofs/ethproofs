"use client"

import { ColumnDef } from "@tanstack/react-table"

import { BlockWithProofs, Proof } from "@/lib/types"

import Clipboard from "@/components/Clipboard"
import { ButtonLink } from "@/components/ui/button"

import { cn } from "@/lib/utils"

import { formatTimeAgo } from "@/lib/date"
import { formatNumber } from "@/lib/number"
import { getProofsAvgCost, getProofsAvgLatency } from "@/lib/proofs"

const Null = () => <span className="text-body-secondary">{"-"}</span>

export const columns: ColumnDef<BlockWithProofs>[] = [
  {
    accessorKey: "block_number",
    header: () => <div className="text-left">block</div>,
    cell: ({ row, cell }) => {
      const blockNumber = cell.getValue() as number
      const formatted = formatNumber(blockNumber)

      const timestamp = row.original.timestamp
      const formattedTimestamp = timestamp
        ? formatTimeAgo(new Date(timestamp))
        : "pending"

      return (
        <div className="text-start">
          <Clipboard message={blockNumber.toString()}>{formatted}</Clipboard>
          <div className="font-sans text-xs text-body-secondary">
            {formattedTimestamp}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "transaction_count",
    header: "transactions",
    cell: ({ cell }) => {
      const transactionCount = cell.getValue() as number

      if (!transactionCount) return <Null />

      const formatted = formatNumber(transactionCount)

      return formatted
    },
  },
  {
    header: "total fees (gwei)",
    accessorKey: "total_fees",
    cell: ({ cell }) => {
      const totalFeesGwei = cell.getValue() as number

      if (!totalFeesGwei) return <Null />

      const formatted = formatNumber(totalFeesGwei)

      return formatted
    },
  },
  {
    accessorKey: "proofs",
    header: "avg. cost/proof",
    cell: ({ cell }) => {
      const proofs = cell.getValue() as Proof[]
      if (!proofs.length) return <Null />

      const avgCostPerProof = getProofsAvgCost(proofs)

      if (isNaN(avgCostPerProof)) return <Null />

      const formatted = formatNumber(avgCostPerProof, {
        style: "currency",
        currency: "USD",
      })

      return formatted
    },
  },
  {
    accessorKey: "proofs",
    header: "prover status",
    cell: ({ cell }) => {
      const proofs = cell.getValue() as Proof[]

      const latency = getProofsAvgLatency(proofs)

      const getStatusColorClass = (status: string) => {
        if (status === "proved") return "bg-primary"
        if (status === "queued")
          return "bg-transparent outline outline-1 -outline-offset-1 outline-body-secondary"
        if (status === "proving") return "bg-body-secondary"
        return "bg-red-500" // TODO: Confirm / tokenize
      }

      return (
        <div className="mx-auto flex w-20">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-2">
              {proofs.map((proof) => (
                <div
                  key={proof.proof_id}
                  className={cn(
                    "h-2 w-2 rounded-full",
                    getStatusColorClass(proof.proof_status)
                  )}
                />
              ))}
            </div>
            {latency > 0 && (
              <div className="whitespace-nowrap font-sans text-xs text-body-secondary">
                latency {latency.toFixed(0)}s
              </div>
            )}
          </div>
        </div>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const blockNumber = row.original.block_number
      return (
        <div className="text-right">
          <ButtonLink
            href={`/block/${blockNumber}`}
            variant="outline"
            className="whitespace-nowrap"
          >
            + details
          </ButtonLink>
        </div>
      )
    },
  },
]
