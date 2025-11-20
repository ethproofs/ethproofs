"use client"

import { ColumnDef } from "@tanstack/react-table"

import { BlockNumber } from "@/components/BlockNumber"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { Null } from "@/components/Null"
import DownloadButton from "@/components/proof-buttons/download-button"
import type { ProofForDownload } from "@/components/proof-buttons/utils"
import { VerifyButton } from "@/components/proof-buttons/verify-button"
import Link from "@/components/ui/link"

import { Checkbox } from "../ui/checkbox"

import { fetchBlock } from "@/lib/api/blocks"
import { fetchProvedProofsByClusterId } from "@/lib/api/proofs"
import { formatTimeAgoDetailed } from "@/lib/date"
import { formatNumber, formatUsd } from "@/lib/number"
import { getProvingCost, hasProvedTimestamp, isCompleted } from "@/lib/proofs"
import { prettyMs } from "@/lib/time"

// Infer types from both API responses
type ProofFromClusterApi = Awaited<
  ReturnType<typeof fetchProvedProofsByClusterId>
>["rows"][number]
type BlockFromApi = NonNullable<Awaited<ReturnType<typeof fetchBlock>>>
type ProofFromBlockApi = BlockFromApi["proofs"][number]

// Union type that accepts proofs from either API
// Extended with block property that's added by API endpoints
export type ProofRow = (ProofFromClusterApi | ProofFromBlockApi) & {
  block?: { block_number: number; timestamp?: string | null }
}

export const labels = [
  {
    value: "block_number",
    label: "block",
  },
  {
    value: "team",
    label: "team",
  },
  {
    value: "time_to_proof",
    label: "time to proof",
  },
  {
    value: "proving_time",
    label: "proving time",
  },
  {
    value: "proving_cycles",
    label: "cycles",
  },
  {
    value: "cost_per_proof",
    label: "cost per proof",
  },
]

export const getColumns = (): ColumnDef<ProofRow>[] => {
  return [
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
      id: "block_number",
      accessorFn: (proof: ProofRow) => proof.block?.block_number,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="block" />
      ),
      cell: ({ row }) => {
        const blockNumber = row.getValue("block_number") as number
        const timestamp = row.original.block?.timestamp
        const formattedTimestamp = timestamp
          ? formatTimeAgoDetailed(new Date(timestamp))
          : null

        return (
          <div className="w-[100px]">
            <BlockNumber blockNumber={blockNumber} />
            {formattedTimestamp && (
              <div className="text-xs text-muted-foreground">
                {formattedTimestamp}
              </div>
            )}
          </div>
        )
      },
      filterFn: (row, id, value) => {
        const blockNumber = row.getValue(id)
        return blockNumber ? String(blockNumber).includes(value) : false
      },
    } as ColumnDef<ProofRow>,
    {
      id: "team",
      accessorKey: "team",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="team" />
      ),
      cell: ({ row }) => {
        const proof = row.original
        const team = proof.team
        const zkvm = proof.cluster_version?.zkvm_version?.zkvm

        if (!team) return <Null />

        return (
          <div className="w-[180px]">
            <Link
              href={`/clusters/${proof.cluster_version?.cluster?.id}`}
              className="hover:underline"
            >
              {proof.cluster_version?.cluster?.nickname}
            </Link>
            {zkvm && (
              <div className="text-xs text-muted-foreground">
                {zkvm.name} by {team.name}
              </div>
            )}
          </div>
        )
      },
      filterFn: (row, _id, value) => {
        const team = row.original.team
        return team
          ? String(team.name).toLowerCase().includes(value.toLowerCase())
          : false
      },
    } as ColumnDef<ProofRow>,
    {
      id: "time_to_proof",
      accessorFn: (proof: ProofRow) => {
        const isAvailable = isCompleted(proof) && hasProvedTimestamp(proof)
        if (
          !isAvailable ||
          !proof.proved_timestamp ||
          !proof.block?.timestamp
        ) {
          return null
        }
        return Math.max(
          new Date(proof.proved_timestamp).getTime() -
            new Date(proof.block.timestamp).getTime(),
          0
        )
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="time to proof" />
      ),
      cell: ({ row }) => {
        const proof = row.original
        const isAvailable = isCompleted(proof) && hasProvedTimestamp(proof)
        const provedTimestamp = proof.proved_timestamp
        const blockTimestamp = proof.block?.timestamp

        const timeToProof =
          isAvailable && provedTimestamp && blockTimestamp
            ? Math.max(
                new Date(provedTimestamp).getTime() -
                  new Date(blockTimestamp).getTime(),
                0
              )
            : null

        return (
          <div className="w-[100px]">
            {timeToProof ? prettyMs(timeToProof) : <Null />}
          </div>
        )
      },
    },
    {
      id: "proving_time",
      accessorKey: "proving_time",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="proving time" />
      ),
      cell: ({ row }) => {
        const proof = row.original
        const isAvailable = isCompleted(proof) && hasProvedTimestamp(proof)
        const provingTime = proof.proving_time

        return (
          <div className="w-[100px]">
            {isAvailable && provingTime ? prettyMs(provingTime) : <Null />}
          </div>
        )
      },
    },
    {
      id: "proving_cycles",
      accessorKey: "proving_cycles",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="proving cycles" />
      ),
      cell: ({ row }) => {
        const proof = row.original
        const isAvailable = isCompleted(proof) && hasProvedTimestamp(proof)
        const provingCycles = proof.proving_cycles

        return (
          <div className="w-[100px]">
            {isAvailable && provingCycles ? (
              formatNumber(provingCycles, {
                notation: "compact",
                compactDisplay: "short",
                maximumSignificantDigits: 4,
              })
            ) : (
              <Null />
            )}
          </div>
        )
      },
    },
    {
      id: "cost_per_proof",
      accessorFn: (proof: ProofRow) => {
        const isAvailable = isCompleted(proof) && hasProvedTimestamp(proof)
        if (!isAvailable) return null
        return getProvingCost(proof)
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="cost per proof" />
      ),
      cell: ({ row }) => {
        const proof = row.original
        const isAvailable = isCompleted(proof) && hasProvedTimestamp(proof)
        const provingCost = getProvingCost(proof)

        return (
          <div className="w-[100px]">
            {isAvailable && provingCost ? formatUsd(provingCost) : <Null />}
          </div>
        )
      },
    },
    {
      id: "actions",
      header: () => null,
      cell: ({ row }) => {
        const proof = row.original as ProofForDownload
        return (
          <div className="flex flex-row justify-end gap-2">
            <DownloadButton
              proof={proof}
              className="h-9 w-[140px] overflow-hidden text-nowrap"
              labelClass="inline-block"
              containerClass="flex-col-reverse"
            />
            <VerifyButton
              proof={proof}
              className="h-9 w-[140px] overflow-hidden text-nowrap"
              labelClass="inline-block"
              containerClass="flex-col-reverse"
            />
          </div>
        )
      },
      enableSorting: false,
      enableHiding: false,
    },
  ]
}

export const columns = getColumns()
