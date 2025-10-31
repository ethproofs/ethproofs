"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Check, Pizza, X as RedX } from "lucide-react"

import { ActiveZkvm } from "@/components/SoftwareAccordion/ActiveSoftwareAccordion"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"

import Link from "@/components/ui/link"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"

import { ZkvmRow } from "./zkvms-table"
import { ButtonLink } from "../ui/button"

export const labels = [
  {
    value: "name",
    label: "zkVM",
  },
  {
    value: "is_open_source",
    label: "verifier open source",
  },
  {
    value: "dual_licenses",
    label: "dual license",
  },
  {
    value: "is_proving_mainnet",
    label: "mainnet capable",
  },
  {
    value: "versions",
    label: "latest version",
  },
  {
    value: "isa",
    label: "ISA",
  },
  {
    value: "activeClusters",
    label: "used by",
  },
]

export const columns: ColumnDef<ZkvmRow>[] = [
  {
    id: "zkvm",
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="zkVM" />
    ),
    cell: ({ row }) => {
      const zkvm = row.original

      return (
        <div className="w-[120px]">
          <Link href={`/zkvms/${zkvm.slug}`} className="hover:underline">
            {zkvm.name}
          </Link>
          <div className="text-xs text-muted-foreground">{zkvm.team.name}</div>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    id: "used_by",
    accessorKey: "activeClusters",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="used by" />
    ),
    cell: ({ row }) => {
      const zkvm = row.original
      return (
        <div className="w-[100px]">
          <Progress
            value={
              zkvm.totalClusters > 0
                ? (zkvm.activeClusters / zkvm.totalClusters) * 100
                : 0
            }
            className="mx-auto my-[6px] h-2 max-w-32"
          />
          <span className="text-xs text-muted-foreground">
            {zkvm.activeClusters}/{zkvm.totalClusters} provers
          </span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    id: "is_open_source",
    accessorKey: "is_open_source",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="open source" />
    ),
    cell: ({ row }) => {
      const isOpenSource = row.getValue("is_open_source") as boolean
      return (
        <div className="w-[100px]">
          {isOpenSource ? (
            <div className="flex items-center gap-1 text-primary">
              <Check className="size-4" />
              <span>verifier</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-level-worst">
              <RedX className="size-4" />
              <span>verifier</span>
            </div>
          )}
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    id: "dual_licenses",
    accessorKey: "dual_licenses",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="license" />
    ),
    cell: ({ row }) => {
      const dualLicenses = row.getValue("dual_licenses") as boolean
      return (
        <div className="w-[100px]">
          {dualLicenses ? (
            <div className="flex items-center gap-1 text-primary">
              <Check className="size-4" />
              <span>dual</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-level-worst">
              <RedX className="size-4" />
              <span>dual</span>
            </div>
          )}
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    id: "is_proving_mainnet",
    accessorKey: "is_proving_mainnet",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="proving" />
    ),
    cell: ({ row }) => {
      const isProvingMainnet = row.getValue("is_proving_mainnet") as boolean
      return (
        <div className="w-[100px]">
          {isProvingMainnet ? (
            <div className="flex items-center gap-1 text-primary">
              <Check className="size-4" />
              <span>layer 1</span>
            </div>
          ) : (
            <RedX className="size-4 text-level-worst" />
          )}
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    id: "version",
    accessorKey: "versions",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="version" />
    ),
    cell: ({ row }) => {
      const versions = row.getValue("version") as ActiveZkvm["versions"]
      const latestVersion = versions.reduce((latest, version) =>
        version.id > latest.id ? version : latest
      )
      return <div className="w-[100px]">{latestVersion.version || "N/A"}</div>
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    id: "isa",
    accessorKey: "isa",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ISA" />
    ),
    cell: ({ row }) => {
      const isa = row.getValue("isa") as string
      return <div className="w-[100px]">{isa}</div>
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <ButtonLink
        variant="outline"
        size="icon"
        href={`/zkvms/${row.original.slug}`}
      >
        <Pizza />
      </ButtonLink>
    ),
  },
]
