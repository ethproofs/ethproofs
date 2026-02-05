"use client"

import { Check, Clock, Pencil } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { Button } from "@/components/ui/button"

export type DashboardZkvm = {
  id: number
  name: string
  slug: string
  isa: string
  repo_url: string | null
  is_open_source: boolean
  is_dual_licensed: boolean
  is_proving_mainnet: boolean
  approved: boolean
  versions: {
    id: number
    version: string
  }[]
  security_metrics: {
    implementation_soundness: string
    evm_stf_bytecode: string
    quantum_security: string
    security_target_bits: number
    max_bounty_amount: number
  } | null
  performance_metrics: {
    size_bytes: number
    verification_ms: number
  } | null
}

export const zkvmColumns: ColumnDef<DashboardZkvm>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="name" />
    ),
    cell: ({ row }) => {
      const zkvm = row.original
      return (
        <div className="min-w-[120px]">
          <div className="font-medium">{zkvm.name}</div>
          <div className="text-xs text-muted-foreground">{zkvm.slug}</div>
        </div>
      )
    },
  },
  {
    id: "version",
    header: "version",
    cell: ({ row }) => {
      const zkvm = row.original
      const latestVersion = zkvm.versions[0]
      return (
        <div className="min-w-[80px]">
          <div className="text-sm">
            {latestVersion ? `v${latestVersion.version}` : "—"}
          </div>
        </div>
      )
    },
  },
  {
    id: "isa",
    accessorKey: "isa",
    header: "isa",
    cell: ({ row }) => {
      return (
        <div className="min-w-[80px]">
          <div className="text-sm">{row.original.isa}</div>
        </div>
      )
    },
  },
  {
    id: "status",
    accessorKey: "approved",
    header: "status",
    cell: ({ row }) => {
      const isApproved = row.original.approved
      return (
        <div className="w-[100px]">
          {isApproved ? (
            <div className="flex items-center gap-1 text-primary">
              <Check className="size-4" />
              <span className="text-sm">approved</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="size-4" />
              <span className="text-sm">pending</span>
            </div>
          )}
        </div>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const zkvm = row.original
      const onEdit = (
        table.options.meta as { onEdit?: (zkvm: DashboardZkvm) => void }
      )?.onEdit

      return (
        <div className="flex justify-end">
          <Button variant="outline" size="icon" onClick={() => onEdit?.(zkvm)}>
            <Pencil />
          </Button>
        </div>
      )
    },
  },
]
