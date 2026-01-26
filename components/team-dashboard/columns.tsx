import { Check, Pencil, X as RedX } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"

import CopyButton from "@/components/copy-button"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type ClusterVersion = {
  id: number
  index: number
  zkvm_version_id: number
  vk_path: string | null
  is_active: boolean
  zkvm_version?: {
    version: string
    zkvm: {
      name: string
    }
  }
}

export type DashboardCluster = {
  id: string
  name: string
  num_gpus: number
  hardware_description: string | null
  is_active: boolean
  prover_type: {
    id: number
    name: string
    processing_ratio: string
    gpu_configuration: string
    deployment_type: string
  } | null
  guest_program: {
    id: number
    name: string
  } | null
  versions: ClusterVersion[]
}

export const columns: ColumnDef<DashboardCluster>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="name" />
    ),
    cell: ({ row }) => {
      const cluster = row.original
      const truncatedId = `${cluster.id.slice(0, 8)}...`
      return (
        <div className="min-w-[120px]">
          <div className="font-medium">{cluster.name}</div>
          <div className="flex items-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-default text-xs text-muted-foreground">
                  {truncatedId}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-mono text-xs">{cluster.id}</p>
              </TooltipContent>
            </Tooltip>
            <CopyButton
              message={cluster.id}
              className="size-5 text-muted-foreground"
              iconClassName="!size-3"
            />
          </div>
        </div>
      )
    },
  },
  {
    id: "status",
    accessorKey: "is_active",
    header: "status",
    cell: ({ row }) => {
      const isActive = row.original.is_active
      return (
        <div className="w-[80px]">
          {isActive ? (
            <div className="flex items-center gap-1 text-primary">
              <Check className="size-4" />
              <span className="text-sm">active</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-muted-foreground">
              <RedX className="size-4 text-level-worst" />
              <span className="text-sm text-level-worst">inactive</span>
            </div>
          )}
        </div>
      )
    },
  },
  {
    id: "prover_type",
    accessorKey: "prover_type",
    header: "prover type",
    cell: ({ row }) => {
      const proverType = row.original.prover_type
      return (
        <div className="min-w-[150px]">
          <div className="text-sm">{proverType?.name.toLowerCase() || "—"}</div>
        </div>
      )
    },
  },
  {
    id: "guest_program",
    accessorKey: "guest_program",
    header: "guest",
    cell: ({ row }) => {
      const guestProgram = row.original.guest_program
      return (
        <div className="min-w-[80px]">
          <div className="text-sm">
            {guestProgram?.name.toLowerCase() || "—"}
          </div>
        </div>
      )
    },
  },
  {
    id: "hardware",
    accessorKey: "hardware_description",
    header: "hardware",
    cell: ({ row }) => {
      const hardware = row.original.hardware_description
      return (
        <div className="min-w-[200px] max-w-[300px]">
          <div className="truncate text-sm text-muted-foreground">
            {hardware || "—"}
          </div>
        </div>
      )
    },
  },
  {
    id: "num_gpus",
    accessorKey: "num_gpus",
    header: "GPUs",
    cell: ({ row }) => {
      const numGpus = row.original.num_gpus
      return (
        <div className="w-[80px]">
          <div className="text-sm">{numGpus}</div>
        </div>
      )
    },
  },
  {
    id: "version",
    header: "version",
    cell: ({ row }) => {
      const cluster = row.original
      const activeVersion =
        cluster.versions?.find((v) => v.is_active) || cluster.versions?.[0]

      if (!activeVersion?.zkvm_version) {
        return (
          <div className="min-w-[80px] text-sm text-muted-foreground">—</div>
        )
      }

      return (
        <div className="min-w-[80px]">
          <div className="text-sm">{activeVersion.zkvm_version.zkvm.name}</div>
          <div className="text-xs text-muted-foreground">
            v{activeVersion.zkvm_version.version}
          </div>
        </div>
      )
    },
  },
  {
    id: "vk_path",
    header: "vk path",
    cell: ({ row }) => {
      const cluster = row.original
      const activeVersion =
        cluster.versions?.find((v) => v.is_active) || cluster.versions?.[0]
      const hasVkPath = activeVersion?.vk_path

      return (
        <div className="w-[60px]">
          {hasVkPath ? (
            <div className="flex items-center gap-1 text-primary">
              <Check className="size-4" />
            </div>
          ) : (
            <div className="flex items-center gap-1 text-muted-foreground">
              <RedX className="size-4 text-level-worst" />
            </div>
          )}
        </div>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const cluster = row.original
      const onEdit = (
        table.options.meta as { onEdit?: (cluster: DashboardCluster) => void }
      )?.onEdit

      return (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onEdit?.(cluster)}
          >
            <Pencil />
          </Button>
        </div>
      )
    },
  },
]
