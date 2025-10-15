"use client"

import { ColumnDef } from "@tanstack/react-table"

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import Null from "@/components/Null"

import { formatNumber } from "@/lib/number"
import { prettyMs } from "@/lib/time"

export type CspBenchmarkRow = {
  benchmarkId: string
  name: string
  feat: string
  is_zkvm: boolean
  target: string
  input_size: number
  proof_duration: number // nanoseconds
  verify_duration: number // nanoseconds
  cycles: number
  proof_size: number
  preprocessing_size: number
  peak_memory: number
}

export const columns: ColumnDef<CspBenchmarkRow>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="name" />
    ),
    cell: ({ row }) => {
      const name = row.getValue("name") as string
      return <div className="w-[120px] font-medium">{name}</div>
    },
  },
  {
    id: "feat",
    accessorKey: "feat",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="feature" />
    ),
    cell: ({ row }) => {
      const feat = row.getValue("feat") as string
      return (
        <div className="w-[100px]">
          {feat ? <span className="text-xs">{feat}</span> : <Null />}
        </div>
      )
    },
  },
  {
    id: "is_zkvm",
    accessorKey: "is_zkvm",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="zkVM" />
    ),
    cell: ({ row }) => {
      const isZkvm = row.getValue("is_zkvm") as string
      return (
        <div className="w-[100px]">
          <span className="text-xs">{isZkvm ? "Yes" : "No"}</span>
        </div>
      )
    },
  },
  {
    id: "target",
    accessorKey: "target",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="target" />
    ),
    cell: ({ row }) => {
      const target = row.getValue("target") as string
      return <div className="w-[120px]">{target}</div>
    },
  },
  {
    id: "input_size",
    accessorKey: "input_size",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="input size" />
    ),
    cell: ({ row }) => {
      const inputSize = row.getValue("input_size") as number
      return (
        <div className="w-[100px]">
          {formatNumber(inputSize, { notation: "standard" })}
        </div>
      )
    },
  },
  {
    id: "proof_duration",
    accessorKey: "proof_duration",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="proof duration" />
    ),
    cell: ({ row }) => {
      const proofDuration = row.getValue("proof_duration") as number
      // Convert nanoseconds to milliseconds
      const ms = proofDuration / 1_000_000
      return <div className="w-[120px]">{prettyMs(ms)}</div>
    },
  },
  {
    id: "verify_duration",
    accessorKey: "verify_duration",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="verify duration" />
    ),
    cell: ({ row }) => {
      const verifyDuration = row.getValue("verify_duration") as number
      // Convert nanoseconds to milliseconds
      const ms = verifyDuration / 1_000_000
      return <div className="w-[120px]">{prettyMs(ms)}</div>
    },
  },
  {
    id: "cycles",
    accessorKey: "cycles",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="cycles" />
    ),
    cell: ({ row }) => {
      const cycles = row.getValue("cycles") as number
      return (
        <div className="w-[100px]">
          {formatNumber(cycles, {
            notation: "compact",
            compactDisplay: "short",
          })}
        </div>
      )
    },
  },
  {
    id: "proof_size",
    accessorKey: "proof_size",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="proof size" />
    ),
    cell: ({ row }) => {
      const proofSize = row.getValue("proof_size") as number
      return (
        <div className="w-[100px]">
          {formatNumber(proofSize, {
            notation: "compact",
            compactDisplay: "short",
          })}{" "}
          <span className="text-xs text-muted-foreground">bytes</span>
        </div>
      )
    },
  },
  {
    id: "preprocessing_size",
    accessorKey: "preprocessing_size",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="preprocessing size" />
    ),
    cell: ({ row }) => {
      const preprocessingSize = row.getValue("preprocessing_size") as number
      return (
        <div className="w-[140px]">
          {formatNumber(preprocessingSize, {
            notation: "compact",
            compactDisplay: "short",
          })}{" "}
          <span className="text-xs text-muted-foreground">bytes</span>
        </div>
      )
    },
  },
  {
    id: "peak_memory",
    accessorKey: "peak_memory",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="peak memory" />
    ),
    cell: ({ row }) => {
      const peakMemory = row.getValue("peak_memory") as number
      return (
        <div className="w-[120px]">
          {formatNumber(peakMemory, {
            notation: "compact",
            compactDisplay: "short",
          })}{" "}
          <span className="text-xs text-muted-foreground">bytes</span>
        </div>
      )
    },
  },
]
