"use client"

import { Check, X as RedX } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import Link from "@/components/ui/link"

import { Null } from "../null"

import type { TeamTableRow } from "@/lib/api/teams-metrics"
import { formatNumber, formatUsd } from "@/lib/number"
import { prettyMs } from "@/lib/time"

const CONTRIBUTION_COLORS: Record<string, string> = {
  zkvm: "bg-chart-2",
  guest: "bg-chart-9",
  prover: "bg-chart-12",
}

export const teamsTableColumns: ColumnDef<TeamTableRow>[] = [
  {
    id: "team",
    accessorKey: "teamName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="team name" />
    ),
    cell: ({ row }) => {
      const team = row.original
      return (
        <div className="w-[160px]">
          <Link href={`/teams/${team.teamSlug}`} className="hover:underline">
            {team.teamName}
          </Link>
        </div>
      )
    },
  },
  {
    id: "zkvms",
    accessorKey: "zkvmCount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="zkVMs" />
    ),
    cell: ({ row }) => {
      const count = row.original.zkvmCount
      if (count === 0) return <Null />
      return (
        <div className="flex items-center gap-1">
          {Array.from({ length: count }, (_, i) => (
            <span
              key={i}
              className={`inline-block size-2.5 rounded-full ${CONTRIBUTION_COLORS.zkvm}`}
            />
          ))}
        </div>
      )
    },
  },
  {
    id: "guests",
    accessorKey: "guestCount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="guests" />
    ),
    cell: ({ row }) => {
      const count = row.original.guestCount
      if (count === 0) return <Null />
      return (
        <div className="flex items-center gap-1">
          {Array.from({ length: count }, (_, i) => (
            <span
              key={i}
              className={`inline-block size-2.5 rounded-full ${CONTRIBUTION_COLORS.guest}`}
            />
          ))}
        </div>
      )
    },
  },
  {
    id: "provers",
    accessorKey: "proverCount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="provers" />
    ),
    cell: ({ row }) => {
      const count = row.original.proverCount
      if (count === 0) return <Null />
      return (
        <div className="flex items-center gap-1">
          {Array.from({ length: count }, (_, i) => (
            <span
              key={i}
              className={`inline-block size-2.5 rounded-full ${CONTRIBUTION_COLORS.prover}`}
            />
          ))}
        </div>
      )
    },
  },
  {
    id: "total_proofs",
    accessorKey: "totalProofs",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="proofs" />
    ),
    cell: ({ row }) => {
      const val = row.original.totalProofs
      return <div className="w-[100px]">{val > 0 ? formatNumber(val) : 0}</div>
    },
  },
  {
    id: "proving_time",
    accessorKey: "avgProvingTime",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="proving time" />
    ),
    cell: ({ row }) => {
      const val = row.original.avgProvingTime
      return (
        <div className="w-[90px]">{val > 0 ? prettyMs(val) : <Null />}</div>
      )
    },
  },
  {
    id: "performance",
    accessorKey: "performanceScore",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="performance %" />
    ),
    cell: ({ row }) => {
      const score = row.original.performanceScore
      if (score === 0 && row.original.totalProofs === 0)
        return (
          <div className="w-[80px]">
            <Null />
          </div>
        )
      return <div className="w-[80px]">{score.toFixed(1)}%</div>
    },
  },
  {
    id: "cost",
    accessorKey: "avgCostPerProof",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="avg cost" />
    ),
    cell: ({ row }) => {
      const val = row.original.avgCostPerProof
      return (
        <div className="w-[80px]">{val > 0 ? formatUsd(val) : <Null />}</div>
      )
    },
  },
  {
    id: "rtp",
    accessorKey: "isRtpEligible",
    header: "RTP cohort",
    cell: ({ row }) => (
      <div className="w-[40px] text-center">
        {row.original.isRtpEligible ? (
          <Check className="size-4 text-primary" />
        ) : (
          <RedX className="size-4 text-destructive" />
        )}
      </div>
    ),
    enableSorting: false,
  },
]
