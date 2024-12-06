"use client"

import Link from "next/link"
import prettyMilliseconds from "pretty-ms"
import { ColumnDef } from "@tanstack/react-table"

import type { Proof } from "@/lib/types"

import DownloadButton from "@/components/DownloadButton"
import { metrics } from "@/components/Metrics"
import Null from "@/components/Null"
import { HidePunctuation } from "@/components/StylePunctuation"

import { ColumnHeader } from "./ColumnHeader"

import { formatNumber } from "@/lib/number"

export const columns: ColumnDef<Proof>[] = [
  // Block (time since)
  {
    accessorKey: "block_number",
    header: () => (
      <ColumnHeader
        label={<metrics.blockNumber.Label />}
        className="text-start"
      >
        <metrics.blockNumber.Details />
      </ColumnHeader>
    ),
    cell: ({ cell }) => {
      const blockNumber = cell.getValue() as number
      return (
        <div className="text-start">
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
  // Instance
  {
    accessorKey: "cluster.cluster_name",
    header: () => (
      <ColumnHeader label={<metrics.cluster.Label />}>
        <metrics.cluster.Details />
      </ColumnHeader>
    ),
    cell: ({ cell }) => {
      const instance = cell.getValue() as string

      return instance
    },
  },
  // Time to proof (time from block.timestamp to proof.proved_timestamp)
  {
    accessorKey: "proved_timestamp",
    header: () => (
      <ColumnHeader label={<metrics.totalTTP.Label />}>
        <metrics.totalTTP.Details />
      </ColumnHeader>
    ),
    cell: ({ cell, row }) => {
      const provedTimestamp = cell.getValue() as string
      const blockTimestamp = row.original.block?.timestamp

      if (!provedTimestamp || !blockTimestamp) return <Null />

      const diff =
        new Date(provedTimestamp).getTime() - new Date(blockTimestamp).getTime()

      return diff > 0 ? prettyMilliseconds(diff) : <Null />
    },
  },
  // Proving time (proof.proving_time, duration spent generating proof)
  {
    accessorKey: "proving_time",
    header: () => (
      <ColumnHeader label={<metrics.provingTime.Label />}>
        <metrics.provingTime.Details />
      </ColumnHeader>
    ),
    cell: ({ cell }) => {
      const provingTime = cell.getValue() as number

      if (!provingTime) return <Null />

      return prettyMilliseconds(provingTime)
    },
  },
  // Download button / proof status
  {
    id: "actions",
    cell: ({ row }) => {
      const proof = row.original
      return <DownloadButton proof={proof} />
    },
  },
]
