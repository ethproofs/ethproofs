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
  // Proof status
  {
    accessorKey: "proof_status",
    header: "status",
  },
  // Time to proof (duration)
  // ? Difference between latency and time to proof?
  {
    accessorKey: "proved_timestamp",
    header: "time to proof",
    cell: ({ cell }) => {
      const provedTimestamp = cell.getValue() as string
      // const blockTimestamp = row.original.block
      // TODO: Need block.timestamp here
      if (!provedTimestamp) return <Null />

      return new Date(provedTimestamp).toLocaleString()
    },
  },
  // Latency (duration)
  {
    accessorKey: "proof_latency",
    header: "latency",
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
