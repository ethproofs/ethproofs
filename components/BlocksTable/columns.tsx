"use client"

import { ColumnDef } from "@tanstack/react-table"

import { BlockWithProofs, Proof } from "@/lib/types"

import { ButtonLink } from "@/components/ui/button"

import { cn } from "@/lib/utils"

import { formatTimeAgo, intervalToSeconds } from "@/lib/date"

export const columns: ColumnDef<BlockWithProofs>[] = [
  {
    accessorKey: "block_number",
    header: () => <div className="text-left">block</div>,
    cell: ({ row, cell }) => {
      const blockNumber = cell.getValue() as number
      const formatted = new Intl.NumberFormat("en-US", {
        style: "decimal",
      }).format(blockNumber)

      const timestamp = row.original.timestamp
      const formattedTimestamp = formatTimeAgo(new Date(timestamp))

      return (
        <div className="text-left text-base">
          {formatted}
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

      if (!transactionCount) {
        return null
      }

      const formatted = new Intl.NumberFormat("en-US", {
        style: "decimal",
      }).format(transactionCount)

      return formatted
    },
  },
  {
    header: "total fees",
    cell: ({ cell }) => {
      const totalFees = cell.getValue() as number

      if (!totalFees) {
        return null
      }

      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(totalFees)

      return formatted
    },
  },
  {
    accessorKey: "gas_used",
    header: "avg. cost/proof",
    cell: ({ cell }) => {
      const gasUsed = cell.getValue() as number

      if (!gasUsed) {
        return null
      }

      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(gasUsed)

      return formatted
    },
  },
  {
    accessorKey: "proofs",
    header: "prover status",
    cell: ({ cell }) => {
      const proofs = cell.getValue() as Proof[]
      const latency =
        proofs.reduce(
          (acc, proof) =>
            acc + intervalToSeconds(proof.prover_duration as string),
          0
        ) / proofs.length

      return (
        <div className="flex justify-center">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-2">
              {proofs.map((proof) => (
                <div
                  key={proof.proof_id}
                  className={cn(
                    "h-2 w-2 rounded-full",
                    proof.proof_status === "proved"
                      ? "bg-primary"
                      : "bg-body-secondary"
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
