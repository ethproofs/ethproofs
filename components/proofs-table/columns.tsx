"use client"

import { ColumnDef } from "@tanstack/react-table"

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { BlockNumber } from "@/components/BlockNumber"
import Link from "@/components/ui/link"
import Null from "@/components/Null"
import DownloadButton from "@/components/proof-buttons/DownloadButton"
import { VerifyButton } from "@/components/proof-buttons/VerifyButton"

import { formatTimeAgo } from "@/lib/date"
import { formatNumber, formatUsd } from "@/lib/number"
import { getProvingCost, hasProvedTimestamp, isCompleted } from "@/lib/proofs"
import { prettyMs } from "@/lib/time"
import { fetchProvedProofsByClusterId } from "@/lib/api/proofs"
import { fetchBlock } from "@/lib/api/blocks"

// Infer types from both API responses
type ProofFromClusterApi = Awaited<
  ReturnType<typeof fetchProvedProofsByClusterId>
>[number]
type BlockFromApi = NonNullable<Awaited<ReturnType<typeof fetchBlock>>>
type ProofFromBlockApi = BlockFromApi["proofs"][number]

// Union type that accepts proofs from either API
export type ProofRow =
  | (ProofFromClusterApi & {
      block_number: number
      block_timestamp?: string | null
    })
  | (ProofFromBlockApi & {
      block_number: number
      block_timestamp?: string | null
    })

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
    value: "cost",
    label: "cost per proof",
  },
]

interface ColumnsOptions {
  showBlockNumber?: boolean
  showTeam?: boolean
}

export const getColumns = (
  options: ColumnsOptions = {}
): ColumnDef<ProofRow>[] => {
  const { showBlockNumber = true, showTeam = true } = options

  return [
    ...(showBlockNumber
      ? [
          {
            id: "block_number",
            accessorKey: "block_number",
            header: ({ column }) => (
              <DataTableColumnHeader column={column} title="block" />
            ),
            cell: ({ row }) => {
              const blockNumber = row.getValue("block_number") as number
              const timestamp = row.original.block_timestamp
              const formattedTimestamp = timestamp
                ? formatTimeAgo(new Date(timestamp))
                : null

              return (
                <div className="w-[150px]">
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
              return value.includes(row.getValue(id))
            },
          } as ColumnDef<ProofRow>,
        ]
      : []),
    ...(showTeam
      ? [
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
                <div className="w-[150px]">
                  <Link
                    href={`/teams/${team.slug}`}
                    className="hover:underline"
                  >
                    {team.name}
                  </Link>
                  {zkvm && (
                    <div className="text-xs text-muted-foreground">
                      {zkvm.name}
                    </div>
                  )}
                </div>
              )
            },
            filterFn: (row, id, value) => {
              return value.includes(row.getValue(id))
            },
          } as ColumnDef<ProofRow>,
        ]
      : []),
    {
      id: "time_to_proof",
      accessorKey: "time_to_proof",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="time to proof" />
      ),
      cell: ({ row }) => {
        const proof = row.original
        const isAvailable = isCompleted(proof) && hasProvedTimestamp(proof)
        const provedTimestamp = proof.proved_timestamp
        const blockTimestamp = proof.block_timestamp

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
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
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
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
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
          <div className="w-[120px]">
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
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      id: "cost_per_proof",
      accessorKey: "proofs",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="cost per proof" />
      ),
      cell: ({ row }) => {
        const proof = row.original
        const isAvailable = isCompleted(proof) && hasProvedTimestamp(proof)
        const provingCost = getProvingCost(proof)

        return (
          <div className="w-[120px]">
            {isAvailable && provingCost ? formatUsd(provingCost) : <Null />}
          </div>
        )
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex min-w-[80px] flex-col gap-2 sm:min-w-[200px] sm:gap-4 lg:flex-row">
          <DownloadButton
            proof={row.original}
            className="h-9 w-full min-w-[80px] sm:h-8 sm:min-w-[140px]"
            labelClass="hidden sm:inline-block"
            containerClass="flex-col sm:flex-row-reverse lg:flex-col-reverse"
          />
          <VerifyButton
            proof={row.original}
            className="h-9 w-full min-w-[80px] sm:h-8 sm:min-w-[140px]"
            labelClass="hidden sm:inline-block"
            containerClass="flex-col sm:flex-row-reverse lg:flex-col-reverse"
          />
        </div>
      ),
    },
  ]
}

export const columns = getColumns()
