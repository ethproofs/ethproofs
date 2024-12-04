"use client"
import Link from "next/link"
import prettyMilliseconds from "pretty-ms"
import { ColumnDef } from "@tanstack/react-table"

import type { Proof } from "@/lib/types"

import DownloadButton from "@/components/DownloadButton"
import * as Metrics from "@/components/Metrics"
import Null from "@/components/Null"
import { HidePunctuation } from "@/components/StylePunctuation"

import { ColumnHeader } from "./ColumnHeader"

import { formatNumber } from "@/lib/number"

export const columns: ColumnDef<Proof>[] = [
  // Block (time since)
  {
    accessorKey: "block_number",
    header: () => (
      <ColumnHeader label={Metrics.BLOCK_NUMBER_LABEL} className="text-start">
        <Metrics.BlockNumberDetails />
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
  // Instance / Machine
  {
    accessorKey: "prover_machines.machine_name",
    header: () => (
      <ColumnHeader label={Metrics.CLUSTER_LABEL}>
        <Metrics.ClusterDetails />
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
      <ColumnHeader label={Metrics.TOTAL_TTP_LABEL}>
        <Metrics.TotalTTPDetails />
      </ColumnHeader>
    ),
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
    header: () => (
      <ColumnHeader label={Metrics.PROVING_TIME_LABEL}>
        <Metrics.ProvingTimeDetails />
      </ColumnHeader>
    ),
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
