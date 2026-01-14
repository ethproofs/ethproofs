"use client"

import { ExternalLink } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

import type { GuestProgramRow } from "./guest-programs-table"

export const labels = [
  {
    value: "name",
    label: "guest program",
  },
  {
    value: "activeClusters",
    label: "used by",
  },
  {
    value: "language",
    label: "language",
  },
  {
    value: "maintainer",
    label: "maintainer",
  },
  {
    value: "ecosystem",
    label: "ecosystem",
  },
  {
    value: "license",
    label: "license",
  },
]

interface ColumnsOptions {
  totalActiveClusters: number
}

export const getColumns = ({
  totalActiveClusters,
}: ColumnsOptions): ColumnDef<GuestProgramRow>[] => [
  {
    id: "name",
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="guest program" />
    ),
    cell: ({ row }) => {
      const program = row.original
      return (
        <div className="w-[140px]">
          <span>{program.name}</span>
        </div>
      )
    },
  },
  {
    id: "used_by",
    accessorKey: "activeClusters",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="used by" />
    ),
    cell: ({ row }) => {
      const program = row.original
      return (
        <div className="w-[100px]">
          <Progress
            value={
              totalActiveClusters > 0
                ? (program.activeClusters / totalActiveClusters) * 100
                : 0
            }
            className="mx-auto my-[6px] h-2 max-w-32"
          />
          <span className="text-xs text-muted-foreground">
            {program.activeClusters}/{totalActiveClusters} provers
          </span>
        </div>
      )
    },
  },
  {
    id: "language",
    accessorKey: "language",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="language" />
    ),
    cell: ({ row }) => {
      const language = row.getValue("language") as string
      return <div className="w-[100px]">{language}</div>
    },
  },
  {
    id: "maintainer",
    accessorKey: "maintainer",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="maintainer" />
    ),
    cell: ({ row }) => {
      const maintainer = row.getValue("maintainer") as string
      return <div className="w-[120px]">{maintainer}</div>
    },
  },
  {
    id: "ecosystem",
    accessorKey: "ecosystem",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ecosystem" />
    ),
    cell: ({ row }) => {
      const ecosystem = row.getValue("ecosystem") as string
      return <div className="w-[100px]">{ecosystem}</div>
    },
  },
  {
    id: "license",
    accessorKey: "license",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="license" />
    ),
    cell: ({ row }) => {
      const license = row.getValue("license") as string
      return <div className="w-[100px]">{license}</div>
    },
  },
  {
    id: "actions",
    header: () => null,
    cell: ({ row }) => {
      const program = row.original
      return (
        <div className="flex flex-row justify-end">
          <Button variant="outline" size="icon" asChild>
            <a
              href={program.repo_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink />
            </a>
          </Button>
        </div>
      )
    },
  },
]
