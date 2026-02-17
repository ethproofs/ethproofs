"use client"

import { Check } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"

import type { RtpCohortRow } from "@/lib/types"

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"

import { formatUsd } from "@/lib/number"

function clusterConfigLabel(row: RtpCohortRow): string {
  if (!row.hardware_description) return `${row.num_gpus} GPU`
  return `${row.num_gpus} x ${row.hardware_description}`
}

export const columns: ColumnDef<RtpCohortRow>[] = [
  {
    id: "team",
    accessorKey: "team_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="team name" />
    ),
    cell: ({ row }) => {
      const { team_name, cluster_name } = row.original
      return (
        <div className="w-[180px]">
          <div className="font-medium">{team_name}</div>
          <div className="text-xs text-muted-foreground">{cluster_name}</div>
        </div>
      )
    },
  },
  {
    id: "zkvm",
    accessorKey: "zkvm_name",
    header: "zkVM",
    cell: ({ row }) => (
      <div className="w-[100px] text-sm">{row.original.zkvm_name}</div>
    ),
  },
  {
    id: "guest_program",
    accessorKey: "guest_program_name",
    header: "guest",
    cell: ({ row }) => (
      <div className="w-[100px] text-sm">
        {row.original.guest_program_name ?? "—"}
      </div>
    ),
  },
  {
    id: "cluster_config",
    header: "cluster",
    cell: ({ row }) => (
      <div className="w-[120px] text-sm text-muted-foreground">
        {clusterConfigLabel(row.original)}
      </div>
    ),
  },
  {
    id: "performance_score",
    accessorKey: "performance_score",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="performance" />
    ),
    cell: ({ row }) => (
      <div className="w-[110px] tabular-nums">
        {row.original.performance_score.toFixed(2)}%
      </div>
    ),
  },
  {
    id: "liveness_score",
    accessorKey: "liveness_score",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="liveness" />
    ),
    cell: ({ row }) => (
      <div className="w-[100px] tabular-nums">
        {row.original.liveness_score.toFixed(2)}%
      </div>
    ),
  },
  {
    id: "avg_cost",
    accessorKey: "avg_cost_per_proof",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="cost" />
    ),
    cell: ({ row }) => {
      const cost = row.original.avg_cost_per_proof
      return (
        <div className="w-[100px] tabular-nums">
          {cost != null ? formatUsd(cost) : "—"}
        </div>
      )
    },
  },
  {
    id: "soundcalc",
    accessorKey: "soundcalc_integration",
    header: "soundcalc",
    cell: ({ row }) =>
      row.original.soundcalc_integration ? (
        <Check className="size-4 text-primary" />
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
]
