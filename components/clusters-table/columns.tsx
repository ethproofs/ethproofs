"use client"

import { Check, ChevronRight, X as RedX } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { DisplayTeamLink } from "@/components/DisplayTeamLink"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "@/components/ui/link"

import { ButtonLink } from "../ui/button"

import { ClusterRow } from "./clusters-table"

import { formatUsd } from "@/lib/number"
import { prettyMs } from "@/lib/time"

export const labels = [
  {
    value: "nickname",
    label: "prover",
  },
  {
    value: "is_open_source",
    label: "prover open source",
  },
  {
    value: "software_link",
    label: "binary available",
  },
  {
    value: "avg_cost",
    label: "avg cost per proof",
  },
  {
    value: "avg_time",
    label: "avg proving time",
  },
]

export const columns: ColumnDef<ClusterRow>[] = [
  {
    id: "cluster",
    accessorKey: "nickname",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="prover" />
    ),
    cell: ({ row }) => {
      const cluster = row.original
      const lastVersion = cluster.versions[0]

      if (!lastVersion) return null

      return (
        <div className="w-[200px]">
          <Link href={`/clusters/${cluster.id}`} className="hover:underline">
            {cluster.nickname}
          </Link>
          <div className="text-xs text-muted-foreground">
            {lastVersion.zkvm_version.zkvm.name} by {cluster.team.name}
          </div>
        </div>
      )
    },
  },
  {
    id: "open_source",
    accessorKey: "is_open_source",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="open source" />
    ),
    cell: ({ row }) => {
      const isOpenSource = row.getValue("open_source") as boolean
      return (
        <div className="w-[100px]">
          {isOpenSource ? (
            <div className="flex items-center gap-1 text-primary">
              <Check className="size-4" />
              <span>prover</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-level-worst">
              <RedX className="size-4" />
              <span>prover</span>
            </div>
          )}
        </div>
      )
    },
  },
  {
    id: "binary_available",
    accessorKey: "software_link",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="binary available" />
    ),
    cell: ({ row }) => {
      const softwareLink = row.getValue("binary_available") as string | null
      return (
        <div className="w-[100px]">
          {softwareLink ? (
            <div className="flex items-center gap-1 text-primary">
              <Check className="size-4" />
              <span>reproducible</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-level-worst">
              <RedX className="size-4" />
              <span>reproducible</span>
            </div>
          )}
        </div>
      )
    },
  },
  {
    id: "avg_cost",
    accessorKey: "avg_cost",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="avg cost" />
    ),
    cell: ({ row }) => {
      const avgCost = row.getValue("avg_cost") as number
      return <div className="w-[100px]">{formatUsd(avgCost)}</div>
    },
  },
  {
    id: "avg_time",
    accessorKey: "avg_time",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="avg time" />
    ),
    cell: ({ row }) => {
      const avgTime = row.getValue("avg_time") as number
      return <div className="w-[100px]">{prettyMs(avgTime)}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <ButtonLink
        variant="outline"
        size="icon"
        href={`/clusters/${row.original.id}`}
      >
        <ChevronRight />
      </ButtonLink>
    ),
  },
]
