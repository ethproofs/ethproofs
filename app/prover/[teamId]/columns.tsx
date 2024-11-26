"use client"

import { ColumnDef } from "@tanstack/react-table"

import type { Proof } from "@/lib/types"

import { ButtonLink } from "@/components/ui/button"

import { intervalToReadable } from "@/lib/date"
import { formatNumber } from "@/lib/number"

export const columns: ColumnDef<Proof>[] = [
  // Block (time since)
  {
    accessorKey: "block_number",
    header: () => <div className="text-left">block</div>,
    cell: ({ cell }) => {
      const blockNumber = cell.getValue() as number
      const formatted = formatNumber(blockNumber)

      return <div className="text-start text-base">{formatted}</div>
    },
  },
  // Instance / Machine
  {
    accessorKey: "prover_machines.machine_name",
    header: "instance",
    cell: ({ cell }) => {
      const instance = cell.getValue() as string

      return instance
    },
  },
  // Proof status
  {
    accessorKey: "proof_status",
    header: "status",
  },
  // Time to proof (duration)
  // ? Difference between latency and time to proof?
  {
    accessorKey: "prover_duration",
    header: "time to proof",
    cell: ({ cell }) => {
      const interval = cell.getValue() as string

      if (!interval) return ""

      const formatted = intervalToReadable(interval)

      return formatted
    },
  },
  // Latency (duration)
  // ? Difference between latency and time to proof?
  {
    accessorKey: "proof_latency",
    header: "latency",
    cell: ({ cell }) => {
      const latency = cell.getValue() as number

      if (!latency) return ""

      return `${latency}s`
    },
  },
  // Cost (USD)
  {
    accessorKey: "proving_cost",
    header: "prover status",
    cell: ({ cell }) => {
      const cost = cell.getValue() as number

      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(cost)

      return formatted
    },
  },
  // Details
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
