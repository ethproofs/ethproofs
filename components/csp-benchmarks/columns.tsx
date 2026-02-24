"use client"

import { Check, Eye, Info, X as RedX } from "lucide-react"
import type { ColumnDef, VisibilityState } from "@tanstack/react-table"

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { Null } from "@/components/Null"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { buildSystemPropertiesFromRow, type SystemProperties } from "./system/properties"

import type { Metrics } from "@/lib/api/csp-benchmarks"
import { formatBytes, formatNumber } from "@/lib/number"
import { prettyMs } from "@/lib/time"

const nanosecondsPerMillisecond = 1_000_000

const auditStatusDisplay: Record<string, string> = {
  audited: "audited",
  not_audited: "not audited",
  partially_audited: "partially audited",
}

export const labels = [
  { value: "name", label: "name" },
  { value: "feat", label: "feature" },
  { value: "is_zkvm", label: "VM" },
  { value: "target", label: "target" },
  { value: "input_size", label: "input" },
  { value: "proof_duration", label: "proving time" },
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
  num_constraints: true,
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
  cycles: true,
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
            prettyMs(value / nanosecondsPerMillisecond)
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
        <div style={{ width: 100 }}>
          <span className="font-medium">{row.original.name}</span>
        </div>
      ),
    },
    {
      id: "actions",
      header: () => <span className="text-xs text-muted-foreground">info</span>,
      enableSorting: false,
      enableHiding: false,
      size: 28,
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          aria-label={`view ${row.original.name} details`}
          onClick={() =>
            options?.onOpenDrawer?.(buildSystemPropertiesFromRow(row.original))
          }
        >
          <Eye className="size-3.5" />
        </Button>
      ),
    },
    createTextColumn("feat", "feature", 80),
    createNumberColumn("input_size", "input", 80),
    createDurationColumn("proof_duration", "proving time", 80),
    createDurationColumn("verify_duration", "verification", 80),
    createBytesColumn("peak_memory", "memory", 72),
    createBytesColumn("proof_size", "proof size", 72),
    createBytesColumn("preprocessing_size", "preprocessing", 80),
    createNumberColumn("num_constraints", "constraints", 72, {
      tooltip: "constraint count for proving systems (not applicable to zkVMs)",
      isCompact: true,
    }),
    createTextColumn("target", "target", 80),
    createBooleanColumn("is_zkvm", "VM", 48),
    createTextColumn("proving_system", "proving system", 100),
    createTextColumn("field_curve", "field/curve", 100),
    createBooleanColumn("is_zk", "ZK", 48),
    createBooleanColumn("is_pq", "post-quantum", 48),
    createNumberColumn("security_bits", "security bits", 72),
    {
      id: "is_audited",
      accessorKey: "is_audited",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="audited" />
      ),
      cell: ({ row }) => {
        const value = row.original.is_audited
        return (
          <div style={{ width: 80 }}>
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
    createBooleanColumn("is_maintained", "maintained", 48),
    createTextColumn("iop", "IOP", 80, "interactive oracle proof"),
    createTextColumn("pcs", "PCS", 80, "polynomial commitment scheme"),
    createTextColumn("arithm", "arithmetization", 80, "arithmetization method"),
    createNumberColumn("cycles", "cycles", 72, {
      tooltip: "execution cycles for zkVMs (not applicable to proving systems)",
      isCompact: true,
    }),
    createTextColumn("isa", "ISA", 80, "instruction set architecture"),
  ]
}
