"use client"

import { ColumnDef } from "@tanstack/react-table"

import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import Null from "@/components/Null"

import { CspCollectedBenchmark } from "@/lib/api/csp-benchmarks"
import { formatNumber } from "@/lib/number"
import { prettyMs } from "@/lib/time"

export const labels = [
  {
    value: "name",
    label: "name",
  },
  {
    value: "feat",
    label: "feature",
  },
  {
    value: "is_zkvm",
    label: "zkVM",
  },
  {
    value: "target",
    label: "target",
  },
  {
    value: "input_size",
    label: "input size",
  },
  {
    value: "proof_duration",
    label: "proof duration",
  },
  {
    value: "witgen_duration",
    label: "witgen duration",
  },
  {
    value: "verify_duration",
    label: "verify duration",
  },
  {
    value: "proof_size",
    label: "proof size",
  },
  {
    value: "preprocessing_size",
    label: "preprocessing size",
  },
  {
    value: "peak_memory",
    label: "peak memory",
  },
  {
    value: "peak_memory_witgen",
    label: "peak memory (witgen)",
  },
  {
    value: "n_constraints",
    label: "constraints",
  },
  {
    value: "is_maintained",
    label: "maintained",
  },
  {
    value: "is_zk",
    label: "ZK",
  },
  {
    value: "is_audited",
    label: "audited",
  },
  {
    value: "proving_system",
    label: "proving system",
  },
  {
    value: "field_curve",
    label: "field/curve",
  },
  {
    value: "iop",
    label: "IOP",
  },
  {
    value: "pcs",
    label: "PCS",
  },
  {
    value: "arithm",
    label: "arithmetization",
  },
  {
    value: "security_bits",
    label: "security bits",
  },
  {
    value: "cycles",
    label: "cycles",
  },
  {
    value: "isa",
    label: "ISA",
  },
]

export const columns: ColumnDef<CspCollectedBenchmark>[] = [
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
      const feat = row.getValue("feat") as string | undefined
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
      const isZkvm = row.getValue("is_zkvm") as boolean
      return (
        <div className="w-[80px]">
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
          {formatNumber(inputSize, {
            notation: "compact",
            compactDisplay: "short",
          })}{" "}
          <span className="text-xs text-muted-foreground">bytes</span>
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
      const ms = proofDuration / 1_000_000
      return <div className="w-[120px]">{prettyMs(ms)}</div>
    },
  },
  {
    id: "witgen_duration",
    accessorKey: "witgen_duration",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="witgen duration" />
    ),
    cell: ({ row }) => {
      const witgenDuration = row.getValue("witgen_duration") as
        | number
        | undefined
      return (
        <div className="w-[120px]">
          {witgenDuration !== undefined ? (
            prettyMs(witgenDuration / 1_000_000)
          ) : (
            <Null />
          )}
        </div>
      )
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
      const ms = verifyDuration / 1_000_000
      return <div className="w-[120px]">{prettyMs(ms)}</div>
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
  {
    id: "peak_memory_witgen",
    accessorKey: "peak_memory_witgen",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="peak memory (witgen)" />
    ),
    cell: ({ row }) => {
      const peakMemoryWitgen = row.getValue("peak_memory_witgen") as
        | number
        | undefined
      return (
        <div className="w-[140px]">
          {peakMemoryWitgen !== undefined ? (
            <>
              {formatNumber(peakMemoryWitgen, {
                notation: "compact",
                compactDisplay: "short",
              })}{" "}
              <span className="text-xs text-muted-foreground">bytes</span>
            </>
          ) : (
            <Null />
          )}
        </div>
      )
    },
  },
  {
    id: "n_constraints",
    accessorKey: "n_constraints",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="constraints" />
    ),
    cell: ({ row }) => {
      const nConstraints = row.getValue("n_constraints") as number
      return (
        <div className="w-[100px]">
          {formatNumber(nConstraints, {
            notation: "compact",
            compactDisplay: "short",
          })}
        </div>
      )
    },
  },
  {
    id: "is_maintained",
    accessorKey: "is_maintained",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="maintained" />
    ),
    cell: ({ row }) => {
      const isMaintained = row.getValue("is_maintained") as boolean
      return (
        <div className="w-[100px]">
          <span className="text-xs">{isMaintained ? "Yes" : "No"}</span>
        </div>
      )
    },
  },
  {
    id: "is_zk",
    accessorKey: "is_zk",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ZK" />
    ),
    cell: ({ row }) => {
      const isZk = row.getValue("is_zk") as boolean
      return (
        <div className="w-[80px]">
          <span className="text-xs">{isZk ? "Yes" : "No"}</span>
        </div>
      )
    },
  },
  {
    id: "is_audited",
    accessorKey: "is_audited",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="audited" />
    ),
    cell: ({ row }) => {
      const isAudited = row.getValue("is_audited") as boolean
      return (
        <div className="w-[80px]">
          <span className="text-xs">{isAudited ? "Yes" : "No"}</span>
        </div>
      )
    },
  },
  {
    id: "proving_system",
    accessorKey: "proving_system",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="proving system" />
    ),
    cell: ({ row }) => {
      const provingSystem = row.getValue("proving_system") as string
      return <div className="w-[120px]">{provingSystem}</div>
    },
  },
  {
    id: "field_curve",
    accessorKey: "field_curve",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="field/curve" />
    ),
    cell: ({ row }) => {
      const fieldCurve = row.getValue("field_curve") as string
      return <div className="w-[120px]">{fieldCurve}</div>
    },
  },
  {
    id: "iop",
    accessorKey: "iop",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="IOP" />
    ),
    cell: ({ row }) => {
      const iop = row.getValue("iop") as string
      return <div className="w-[100px]">{iop}</div>
    },
  },
  {
    id: "pcs",
    accessorKey: "pcs",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="PCS" />
    ),
    cell: ({ row }) => {
      const pcs = row.getValue("pcs") as string | undefined
      return (
        <div className="w-[100px]">
          {pcs ? <span className="text-xs">{pcs}</span> : <Null />}
        </div>
      )
    },
  },
  {
    id: "arithm",
    accessorKey: "arithm",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="arithmetization" />
    ),
    cell: ({ row }) => {
      const arithm = row.getValue("arithm") as string | undefined
      return (
        <div className="w-[120px]">
          {arithm ? <span className="text-xs">{arithm}</span> : <Null />}
        </div>
      )
    },
  },
  {
    id: "security_bits",
    accessorKey: "security_bits",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="security bits" />
    ),
    cell: ({ row }) => {
      const securityBits = row.getValue("security_bits") as number
      return <div className="w-[100px]">{securityBits}</div>
    },
  },
  {
    id: "cycles",
    accessorKey: "cycles",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="cycles" />
    ),
    cell: ({ row }) => {
      const cycles = row.getValue("cycles") as number | undefined
      return (
        <div className="w-[100px]">
          {cycles !== undefined ? (
            formatNumber(cycles, {
              notation: "compact",
              compactDisplay: "short",
            })
          ) : (
            <Null />
          )}
        </div>
      )
    },
  },
  {
    id: "isa",
    accessorKey: "isa",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ISA" />
    ),
    cell: ({ row }) => {
      const isa = row.getValue("isa") as string | undefined
      return (
        <div className="w-[100px]">
          {isa ? <span className="text-xs">{isa}</span> : <Null />}
        </div>
      )
    },
  },
]
