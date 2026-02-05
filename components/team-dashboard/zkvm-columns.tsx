"use client"

import { Fragment } from "react"
import { Check, Pencil, Timer, X as RedX } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"

import type {
  PerformanceMetricsData,
  SecurityMetricsData,
  Zkvm,
  ZkvmPendingUpdates,
  ZkvmVersion,
} from "@/lib/types"
import { isZkvmPendingUpdates } from "@/lib/types"

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export type DashboardZkvm = Zkvm & {
  versions: Pick<ZkvmVersion, "id" | "version">[]
  security_metrics: SecurityMetricsData | null
  performance_metrics: PerformanceMetricsData | null
}

interface PendingUpdateEntry {
  label: string
  value: string
}

function formatBoolean(val: boolean): string {
  return val ? "yes" : "no"
}

function getPendingUpdateEntries(
  pendingUpdates: ZkvmPendingUpdates
): PendingUpdateEntry[] {
  const entries: PendingUpdateEntry[] = []

  if (pendingUpdates.name !== undefined) {
    entries.push({ label: "name", value: pendingUpdates.name })
  }
  if (pendingUpdates.isa !== undefined) {
    entries.push({ label: "isa", value: pendingUpdates.isa })
  }
  if (pendingUpdates.repo_url !== undefined) {
    entries.push({
      label: "repository url",
      value: pendingUpdates.repo_url ?? "none",
    })
  }
  if (pendingUpdates.is_open_source !== undefined) {
    entries.push({
      label: "open source",
      value: formatBoolean(pendingUpdates.is_open_source),
    })
  }
  if (pendingUpdates.is_dual_licensed !== undefined) {
    entries.push({
      label: "dual licensed",
      value: formatBoolean(pendingUpdates.is_dual_licensed),
    })
  }
  if (pendingUpdates.is_proving_mainnet !== undefined) {
    entries.push({
      label: "proving mainnet",
      value: formatBoolean(pendingUpdates.is_proving_mainnet),
    })
  }
  if (pendingUpdates.version !== undefined) {
    entries.push({ label: "version", value: `${pendingUpdates.version}` })
  }
  if (pendingUpdates.security_metrics !== undefined) {
    const sm = pendingUpdates.security_metrics
    if (sm.implementation_soundness !== undefined) {
      entries.push({ label: "soundness", value: sm.implementation_soundness })
    }
    if (sm.evm_stf_bytecode !== undefined) {
      entries.push({ label: "evm stf bytecode", value: sm.evm_stf_bytecode })
    }
    if (sm.quantum_security !== undefined) {
      entries.push({ label: "quantum security", value: sm.quantum_security })
    }
    if (sm.security_target_bits !== undefined) {
      entries.push({
        label: "security target bits",
        value: String(sm.security_target_bits),
      })
    }
    if (sm.max_bounty_amount !== undefined) {
      entries.push({
        label: "max bounty amount",
        value: `$${sm.max_bounty_amount.toLocaleString()}`,
      })
    }
  }
  if (pendingUpdates.performance_metrics !== undefined) {
    const pm = pendingUpdates.performance_metrics
    if (pm.size_bytes !== undefined) {
      entries.push({
        label: "proof size",
        value: `${pm.size_bytes.toLocaleString()} bytes`,
      })
    }
    if (pm.verification_ms !== undefined) {
      entries.push({
        label: "verification time",
        value: `${pm.verification_ms}ms`,
      })
    }
  }

  return entries
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
      const { approved, update_status, pending_updates } = row.original
      const isRejected = update_status === "rejected"
      const isPending = update_status === "pending"
      const isNewZkvm = !approved
      const hasPendingEdits =
        isPending && approved && isZkvmPendingUpdates(pending_updates)

      if (isRejected) {
        return (
          <div className="w-[160px]">
            <div className="flex items-center gap-1 text-destructive">
              <RedX className="size-4" />
              <span className="text-sm">rejected</span>
            </div>
          </div>
        )
      }

      if (hasPendingEdits) {
        const entries = getPendingUpdateEntries(pending_updates)
        return (
          <div className="w-[160px]">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex cursor-default items-center gap-1 text-warning">
                  <Timer className="size-4 shrink-0" />
                  <span className="text-sm underline decoration-dotted">
                    pending updates
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" align="start">
                <p className="mb-1 text-xs font-medium">requested changes:</p>
                <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-xs">
                  {entries.map((entry) => (
                    <Fragment key={entry.label}>
                      <dt className="text-muted-foreground">{entry.label}</dt>
                      <dd className="font-medium">{entry.value}</dd>
                    </Fragment>
                  ))}
                </dl>
              </TooltipContent>
            </Tooltip>
          </div>
        )
      }

      if (isNewZkvm) {
        return (
          <div className="w-[160px]">
            <div className="flex items-center gap-1 text-warning">
              <Timer className="size-4" />
              <span className="text-sm">new — awaiting review</span>
            </div>
          </div>
        )
      }

      return (
        <div className="w-[140px]">
          <div className="flex items-center gap-1 text-primary">
            <Check className="size-4" />
            <span className="text-sm">approved</span>
          </div>
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
