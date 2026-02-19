"use client"

import { Check, Info, X as RedX } from "lucide-react"
import type { ColumnDef, VisibilityState } from "@tanstack/react-table"

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { Null } from "@/components/Null"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { buildSystemPropertiesFromRow, type SystemProperties } from "./system/properties"

import type { Metrics } from "@/lib/api/csp-benchmarks"
import { formatBytes, formatNumber } from "@/lib/number"
import { prettyMs } from "@/lib/time"

const auditStatusDisplay: Record<string, string> = {
  audited: "audited",
  not_audited: "not audited",
  partially_audited: "partially audited",
}

export const labels = [
  { value: "name", label: "name" },
  { value: "feat", label: "feature" },
  { value: "is_zkvm", label: "zkVM" },
  { value: "target", label: "target" },
  { value: "input_size", label: "input" },
  { value: "proof_duration", label: "proof gen" },
  { value: "verify_duration", label: "verification" },
  { value: "proof_size", label: "proof size" },
  { value: "preprocessing_size", label: "preprocessing" },
  { value: "peak_memory", label: "memory" },
  { value: "num_constraints", label: "constraints" },
  { value: "is_maintained", label: "maintained" },
  { value: "is_zk", label: "ZK" },
  { value: "is_audited", label: "audited" },
  { value: "proving_system", label: "proving system" },
  { value: "field_curve", label: "field/curve" },
  { value: "iop", label: "IOP" },
  { value: "pcs", label: "PCS" },
  { value: "arithm", label: "arithmetization" },
  { value: "security_bits", label: "security bits" },
  { value: "is_pq", label: "post-quantum" },
  { value: "cycles", label: "cycles" },
  { value: "isa", label: "ISA" },
]

export const defaultColumnVisibility: VisibilityState = {
  name: true,
  feat: false,
  input_size: true,
  proof_duration: true,
  verify_duration: true,
  peak_memory: true,
  proof_size: true,
  preprocessing_size: false,
  num_constraints: false,
  target: false,
  is_zkvm: false,
  proving_system: false,
  field_curve: false,
  is_zk: false,
  is_pq: false,
  security_bits: false,
  is_audited: false,
  is_maintained: false,
  iop: false,
  pcs: false,
  arithm: false,
  cycles: false,
  isa: false,
}

interface TooltipHeaderProps {
  tooltip: string
}

function TooltipHeader({ tooltip }: TooltipHeaderProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="shrink-0 text-muted-foreground hover:text-foreground"
          tabIndex={0}
        >
          <Info className="size-3.5" />
          <span className="sr-only">{tooltip}</span>
        </button>
      </TooltipTrigger>
      <TooltipContent side="top">{tooltip}</TooltipContent>
    </Tooltip>
  )
}

function createTextColumn(
  id: keyof Metrics,
  title: string,
  width: number,
  tooltip?: string
): ColumnDef<Metrics> {
  return {
    id: String(id),
    accessorKey: String(id),
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        <DataTableColumnHeader column={column} title={title} />
        {tooltip && <TooltipHeader tooltip={tooltip} />}
      </div>
    ),
    cell: ({ row }) => {
      const value = row.original[id]
      return (
        <div style={{ width }}>
          {typeof value === "string" && value ? (
            <span className="text-xs">{value}</span>
          ) : (
            <Null />
          )}
        </div>
      )
    },
  }
}

function createNumberColumn(
  id: keyof Metrics,
  title: string,
  width: number,
  options?: { tooltip?: string; isCompact?: boolean }
): ColumnDef<Metrics> {
  return {
    id: String(id),
    accessorKey: String(id),
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        <DataTableColumnHeader column={column} title={title} />
        {options?.tooltip && <TooltipHeader tooltip={options.tooltip} />}
      </div>
    ),
    cell: ({ row }) => {
      const value = row.original[id]
      return (
        <div style={{ width }}>
          {typeof value === "number"
            ? options?.isCompact
              ? formatNumber(value, { notation: "compact", compactDisplay: "short" })
              : formatNumber(value)
            : <Null />}
        </div>
      )
    },
  }
}

function createBooleanColumn(
  id: keyof Metrics,
  title: string,
  width: number
): ColumnDef<Metrics> {
  return {
    id: String(id),
    accessorKey: String(id),
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={title} />
    ),
    cell: ({ row }) => {
      const value = row.original[id]
      if (typeof value !== "boolean") {
        return (
          <div style={{ width }}>
            <Null />
          </div>
        )
      }
      return (
        <div style={{ width }}>
          {value ? (
            <Check className="size-4 text-primary" aria-label="yes" />
          ) : (
            <RedX className="size-4 text-level-worst" aria-label="no" />
          )}
        </div>
      )
    },
  }
}

function createBytesColumn(
  id: keyof Metrics,
  title: string,
  width: number
): ColumnDef<Metrics> {
  return {
    id: String(id),
    accessorKey: String(id),
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={title} />
    ),
    cell: ({ row }) => {
      const value = row.original[id]
      return (
        <div style={{ width }}>
          {typeof value === "number" ? (
            formatBytes(value)
          ) : (
            <Null />
          )}
        </div>
      )
    },
  }
}

function createDurationColumn(
  id: keyof Metrics,
  title: string,
  width: number
): ColumnDef<Metrics> {
  return {
    id: String(id),
    accessorKey: String(id),
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={title} />
    ),
    cell: ({ row }) => {
      const value = row.original[id]
      return (
        <div style={{ width }}>
          {typeof value === "number" && value !== 0 ? (
            prettyMs(value / 1_000_000)
          ) : (
            <Null />
          )}
        </div>
      )
    },
  }
}

interface CspColumnsOptions {
  onOpenDrawer?(system: SystemProperties): void
}

export function getColumns(options?: CspColumnsOptions): ColumnDef<Metrics>[] {
  return [
    {
      id: "name",
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="name" />
      ),
      cell: ({ row }) => (
        <div style={{ width: 120 }}>
          <button
            type="button"
            className="font-medium text-primary underline-offset-2 hover:underline"
            onClick={() =>
              options?.onOpenDrawer?.(buildSystemPropertiesFromRow(row.original))
            }
          >
            {row.original.name}
          </button>
        </div>
      ),
    },
    createTextColumn("feat", "feature", 100),
    {
      id: "input_size",
      accessorKey: "input_size",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="input" />
      ),
      cell: ({ row }) => {
        return (
          <div style={{ width: 100 }}>
            <span className="text-xs">
              {formatNumber(row.original.input_size)}
            </span>
          </div>
        )
      },
    },
    createDurationColumn("proof_duration", "proof gen", 100),
    createDurationColumn("verify_duration", "verification", 110),
    createBytesColumn("peak_memory", "memory", 100),
    createBytesColumn("proof_size", "proof size", 100),
    createBytesColumn("preprocessing_size", "preprocessing", 120),
    createNumberColumn("num_constraints", "constraints", 100, {
      tooltip: "constraint count for native circuits (not applicable to zkVMs)",
      isCompact: true,
    }),
    createTextColumn("target", "target", 100),
    createBooleanColumn("is_zkvm", "zkVM", 80),
    createTextColumn("proving_system", "proving system", 120),
    createTextColumn("field_curve", "field/curve", 120),
    createBooleanColumn("is_zk", "ZK", 80),
    createBooleanColumn("is_pq", "post-quantum", 100),
    createNumberColumn("security_bits", "security bits", 100),
    {
      id: "is_audited",
      accessorKey: "is_audited",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="audited" />
      ),
      cell: ({ row }) => {
        const value = row.original.is_audited
        return (
          <div style={{ width: 100 }}>
            {value ? (
              <span className="text-xs">
                {auditStatusDisplay[value] ?? value}
              </span>
            ) : (
              <Null />
            )}
          </div>
        )
      },
    },
    createBooleanColumn("is_maintained", "maintained", 100),
    createTextColumn("iop", "IOP", 100, "interactive oracle proof"),
    createTextColumn("pcs", "PCS", 100, "polynomial commitment scheme"),
    createTextColumn("arithm", "arithmetization", 120, "arithmetization method"),
    createNumberColumn("cycles", "cycles", 100, {
      tooltip: "execution cycles for zkVMs (not applicable to native circuits)",
      isCompact: true,
    }),
    createTextColumn("isa", "ISA", 100, "instruction set architecture"),
  ]
}
