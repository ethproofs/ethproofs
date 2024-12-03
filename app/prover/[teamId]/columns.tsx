"use client"

import Link from "next/link"
import prettyMilliseconds from "pretty-ms"
import { ColumnDef } from "@tanstack/react-table"

import type { Proof } from "@/lib/types"

import DownloadButton from "@/components/DownloadButton"
import Null from "@/components/Null"
import { HidePunctuation } from "@/components/StylePunctuation"

import { formatNumber } from "@/lib/number"

export const columns: ColumnDef<Proof>[] = [
  // Block (time since)
  {
    accessorKey: "block_number",
    header: () => <div className="text-left">block</div>,
    cell: ({ cell }) => {
      const blockNumber = cell.getValue() as number
      return (
        <div className="text-start text-base">
          <Link
            href={`/block/${blockNumber}`}
            className="tracking-wide hover:text-primary-light hover:underline"
          >
            <HidePunctuation>{formatNumber(blockNumber)}</HidePunctuation>
          </Link>
        </div>
      )
    },
  },
  // Instance / Machine
  {
    accessorKey: "prover_machines.machine_name",
    header: "instance",
    cell: ({ cell }) => {
      const instance = cell.getValue() as string

      return instance
    },
  },
  // Time to proof (time from block.timestamp to proof.proved_timestamp)
  {
    accessorKey: "proved_timestamp",
    header: "time to proof",
    cell: ({ cell, row }) => {
      const provedTimestamp = cell.getValue() as string
      const blockTimestamp = row.original.blocks?.timestamp

      if (!provedTimestamp || !blockTimestamp) return <Null />

      const diff =
        new Date(provedTimestamp).getTime() - new Date(blockTimestamp).getTime()

      return diff > 0 ? prettyMilliseconds(diff) : <Null />
    },
  },
  // Proving time (proof.proof_latency, duration spent generating proof)
  {
    accessorKey: "proof_latency",
    header: "proving time",
    cell: ({ cell }) => {
      const latency = cell.getValue() as number

      if (!latency) return <Null />

      return prettyMilliseconds(latency)
    },
  },
  // Download button / proof status
  {
    id: "actions",
    cell: ({ row }) => {
      const proof = row.original as Proof
      return <DownloadButton proof={proof} />
    },
  },
]
