"use client"

import { ColumnDef } from "@tanstack/react-table"

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { Null } from "@/components/Null"
import { Checkbox } from "@/components/ui/checkbox"

import { Metrics } from "@/lib/api/csp-benchmarks"
import { formatBytes, formatNumber } from "@/lib/number"
import { prettyMs } from "@/lib/time"

export const labels = [
  { value: "name", label: "name" },
  { value: "feat", label: "feature" },
  { value: "is_zkvm", label: "zkVM" },
  { value: "target", label: "target" },
  { value: "input_size", label: "input size" },
  { value: "proof_duration", label: "proof duration" },
  { value: "verify_duration", label: "verify duration" },
  { value: "proof_size", label: "proof size" },
  { value: "preprocessing_size", label: "preprocessing size" },
  { value: "peak_memory", label: "peak memory" },
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

const createTextColumn = (
  id: keyof Metrics,
  title: string,
  width: number
): ColumnDef<Metrics> => ({
  id: id as string,
  accessorKey: id as string,
  header: ({ column }) => (
    <DataTableColumnHeader column={column} title={title} />
  ),
  cell: ({ row }) => (
    <div className={`w-[${width}px]`}>
      {row.getValue(id as string) as string}
    </div>
  ),
})

const createOptionalTextColumn = (
  id: keyof Metrics,
  title: string,
  width: number
): ColumnDef<Metrics> => ({
  id: id as string,
  accessorKey: id as string,
  header: ({ column }) => (
    <DataTableColumnHeader column={column} title={title} />
  ),
  cell: ({ row }) => {
    const value = row.getValue(id as string) as string | undefined
    return (
      <div className={`w-[${width}px]`}>
        {value ? <span className="text-xs">{value}</span> : <Null />}
      </div>
    )
  },
})

const createBooleanColumn = (
  id: keyof Metrics,
  title: string,
  width: number
): ColumnDef<Metrics> => ({
  id: id as string,
  accessorKey: id as string,
  header: ({ column }) => (
    <DataTableColumnHeader column={column} title={title} />
  ),
  cell: ({ row }) => {
    const value = row.getValue(id as string) as boolean
    return (
      <div className={`w-[${width}px]`}>
        <span className="text-xs">{value ? "Yes" : "No"}</span>
      </div>
    )
  },
})

const createBytesColumn = (
  id: keyof Metrics,
  title: string,
  width: number
): ColumnDef<Metrics> => ({
  id: id as string,
  accessorKey: id as string,
  header: ({ column }) => (
    <DataTableColumnHeader column={column} title={title} />
  ),
  cell: ({ row }) => {
    const value = row.getValue(id as string) as number
    return <div className={`w-[${width}px]`}>{formatBytes(value)}</div>
  },
})

const createDurationColumn = (
  id: keyof Metrics,
  title: string,
  width: number
): ColumnDef<Metrics> => ({
  id: id as string,
  accessorKey: id as string,
  header: ({ column }) => (
    <DataTableColumnHeader column={column} title={title} />
  ),
  cell: ({ row }) => {
    const value = row.getValue(id as string) as number
    return <div className={`w-[${width}px]`}>{prettyMs(value / 1_000_000)}</div>
  },
})

const createOptionalCompactNumberColumn = (
  id: keyof Metrics,
  title: string,
  width: number
): ColumnDef<Metrics> => ({
  id: id as string,
  accessorKey: id as string,
  header: ({ column }) => (
    <DataTableColumnHeader column={column} title={title} />
  ),
  cell: ({ row }) => {
    const value = row.getValue(id as string) as number | undefined
    return (
      <div className={`w-[${width}px]`}>
        {value !== undefined ? (
          formatNumber(value, {
            notation: "compact",
            compactDisplay: "short",
          })
        ) : (
          <Null />
        )}
      </div>
    )
  },
})

export const columns: ColumnDef<Metrics>[] = [
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
    cell: ({ row }) => (
      <div className="w-[120px] font-medium">{row.getValue("name")}</div>
    ),
  },
  // createOptionalTextColumn("feat", "feature", 100), // TODO: add column again when used
  createBooleanColumn("is_zkvm", "zkVM", 80),
  createTextColumn("target", "target", 120),
  createBytesColumn("input_size", "input size", 100),
  createDurationColumn("proof_duration", "proof duration", 120),
  createDurationColumn("verify_duration", "verify duration", 120),
  createBytesColumn("proof_size", "proof size", 100),
  createBytesColumn("preprocessing_size", "preprocessing size", 140),
  createBytesColumn("peak_memory", "peak memory", 120),
  {
    id: "num_constraints",
    accessorKey: "num_constraints",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="constraints" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("num_constraints") as number
      return (
        <div className="w-[100px]">
          {formatNumber(value, {
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
      const value = row.getValue("is_maintained") as boolean | undefined
      return (
        <div className="w-[100px]">
          <span className="text-xs">{value ? "Yes" : "No"}</span>
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
      const value = row.getValue("is_zk") as boolean | undefined
      return (
        <div className="w-[80px]">
          <span className="text-xs">{value ? "Yes" : "No"}</span>
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
      const value = row.getValue("is_audited") as
        | "audited"
        | "not_audited"
        | "partially_audited"
        | undefined
      const displayValue =
        value === "audited"
          ? "Yes"
          : value === "partially_audited"
            ? "Partial"
            : "No"
      return (
        <div className="w-[80px]">
          <span className="text-xs">{displayValue}</span>
        </div>
      )
    },
  },
  createOptionalTextColumn("proving_system", "proving system", 120),
  createOptionalTextColumn("field_curve", "field/curve", 120),
  createOptionalTextColumn("iop", "IOP", 100),
  createOptionalTextColumn("pcs", "PCS", 100),
  createOptionalTextColumn("arithm", "arithmetization", 120),
  {
    id: "security_bits",
    accessorKey: "security_bits",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="security bits" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("security_bits") as number | undefined
      return <div className="w-[100px]">{value ?? <Null />}</div>
    },
  },
  {
    id: "is_pq",
    accessorKey: "is_pq",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="post-quantum" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("is_pq") as boolean | undefined
      return (
        <div className="w-[100px]">
          {value !== undefined ? (
            <span className="text-xs">{value ? "Yes" : "No"}</span>
          ) : (
            <Null />
          )}
        </div>
      )
    },
  },
  createOptionalCompactNumberColumn("cycles", "cycles", 100),
  createOptionalTextColumn("isa", "ISA", 100),
]
