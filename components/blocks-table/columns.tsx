"use client"

import { ChevronRight } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"

import { Block, ProofWithCluster } from "@/lib/types"

import { Checkbox } from "@/components/ui/checkbox"

import { BLOCK_GAS_LIMIT } from "@/lib/constants"

import { BlockNumber } from "../BlockNumber"
import { DataTableColumnHeader } from "../data-table/data-table-column-header"
import { Null } from "../Null"
import ProofStatus from "../ProofStatus"
import { HidePunctuation } from "../StylePunctuation"
import { ButtonLink } from "../ui/button"
import { Progress } from "../ui/progress"

import BlockMetric from "./block-metric"

import { formatTimeAgoDetailed } from "@/lib/date"
import { formatNumber } from "@/lib/number"
import {
  getCostPerMgasStats,
  getCostPerProofStats,
  getProofsPerStatusCount,
  getProvingTimeStats,
  getTotalTTPStats,
} from "@/lib/proofs"

export const labels = [
  {
    value: "block_number",
    label: "block",
  },
  {
    value: "gas_used",
    label: "gas used",
  },
  {
    value: "cost_per_proof",
    label: "cost per proof",
  },
  {
    value: "cost_per_mgas",
    label: "cost per mgas",
  },
  {
    value: "proving_time",
    label: "proving time",
  },
  {
    value: "proof_status",
    label: "status",
  },
]

export const columns: ColumnDef<Block>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px] border-border"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px] border-border"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "block_number",
    accessorKey: "block_number",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="block" />
    ),
    cell: ({ row }) => {
      const blockNumber = row.getValue("block_number") as number

      const timestamp = row.original.timestamp
      const formattedTimestamp = timestamp
        ? formatTimeAgoDetailed(new Date(timestamp))
        : "-"

      return (
        <div className="w-[100px]">
          <BlockNumber blockNumber={blockNumber} />
          <div className="text-xs text-muted-foreground">
            {formattedTimestamp}
          </div>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return String(row.getValue(id)).includes(value)
    },
    enableSorting: false,
  },
  {
    id: "gas_used",
    accessorKey: "gas_used",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="gas used" />
    ),
    cell: ({ row }) => {
      const gasUsed = row.getValue("gas_used") as number

      if (!gasUsed) return <Null />

      const formatted = formatNumber(gasUsed)
      const percentGasUsage = (gasUsed / BLOCK_GAS_LIMIT) * 100

      return (
        <div className="w-[140px]">
          <Progress
            value={percentGasUsage}
            className="mx-auto my-[6px] h-2 max-w-32"
          />
          <span className="text-xs text-muted-foreground">
            <HidePunctuation>{formatted}</HidePunctuation>
          </span>
        </div>
      )
    },
    enableSorting: false,
  },
  {
    id: "proving_time",
    accessorKey: "proofs",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="proving time" />
    ),
    cell: ({ cell }) => {
      const proofs = cell.getValue() as ProofWithCluster[]

      const stats = getProvingTimeStats(proofs)

      if (!stats) return <Null />

      return <BlockMetric stats={stats} />
    },
    enableSorting: false,
  },
  {
    id: "cost_per_proof",
    accessorKey: "proofs",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="cost per proof" />
    ),
    cell: ({ cell }) => {
      const proofs = cell.getValue() as ProofWithCluster[]

      const stats = getCostPerProofStats(proofs)

      if (!stats) return <Null />

      return <BlockMetric stats={stats} />
    },
    enableSorting: false,
  },
  {
    id: "cost_per_mgas",
    accessorKey: "proofs",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="cost per Mgas" />
    ),
    cell: ({ row }) => {
      const { proofs, gas_used } = row.original

      const stats = getCostPerMgasStats(proofs, gas_used)

      if (!stats) return <Null />

      return <BlockMetric stats={stats} />
    },
    enableSorting: false,
  },
  {
    id: "proof_status",
    accessorKey: "proofs",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="status" />
    ),
    cell: ({ cell, row }) => {
      const proofs = cell.getValue() as ProofWithCluster[]
      const timestamp = row.original.timestamp

      if (!timestamp) return <Null />

      const totalTTPStats = getTotalTTPStats(proofs, timestamp)
      const proofsPerStatusCount = getProofsPerStatusCount(proofs)

      return (
        <div className="min-w-[160px]">
          <ProofStatus statusCount={proofsPerStatusCount} />
          <span className="block text-xs text-muted-foreground">
            {totalTTPStats?.bestFormatted ?? <Null />}
          </span>
        </div>
      )
    },
    enableSorting: false,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="mr-4 flex flex-row justify-end">
        <ButtonLink
          variant="outline"
          size="icon"
          href={`/blocks/${row.original.block_number}`}
        >
          <ChevronRight />
        </ButtonLink>
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
]
