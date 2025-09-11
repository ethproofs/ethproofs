"use client"

import { ColumnDef } from "@tanstack/react-table"

import type { Block, Proof, ProofWithCluster } from "@/lib/types"

import BlockNumber from "@/components/BlockNumber"
import { ColumnHeader } from "@/components/ColumnHeader"
import { metrics } from "@/components/Metrics"
import Null from "@/components/Null"
import ArrowRight from "@/components/svgs/arrow-right.svg"
import { ButtonLink } from "@/components/ui/button"
import * as Info from "@/components/ui/info"

import { BLOCK_GAS_LIMIT } from "@/lib/constants"

import ProofStatus, { ProofStatusInfo } from "../ProofStatus"
import { HidePunctuation } from "../StylePunctuation"
import { Progress } from "../ui/progress"
import { TooltipContentFooter } from "../ui/tooltip"

import AvgBestMetric from "./AvgBestMetric"

import { formatTimeAgo } from "@/lib/date"
import { formatNumber } from "@/lib/number"
import {
  getCostPerMgasStats,
  getCostPerProofStats,
  getProofsPerStatusCount,
  getProvingTimeStats,
  getTotalTTPStats,
} from "@/lib/proofs"

export const columns: ColumnDef<Block>[] = [
  // Block
  {
    id: "block_number",
    accessorKey: "block_number",
    header: () => (
      <ColumnHeader
        label={<metrics.blockNumber.Label />}
        className="text-center"
      >
        <metrics.blockNumber.Details />
        <TooltipContentFooter className="space-y-3">
          <p className="font-bold">time since block published</p>
          <Info.Derivation>
            <span className="text-primary-light">now</span> -{" "}
            <span className="text-primary-light">timestamp</span>
          </Info.Derivation>
          <p>
            <span className="text-primary-light">timestamp</span> value from
            execution block header
          </p>
        </TooltipContentFooter>
      </ColumnHeader>
    ),
    cell: ({ row, cell }) => {
      const blockNumber = cell.getValue() as number

      const timestamp = row.original.timestamp
      const formattedTimestamp = timestamp
        ? formatTimeAgo(new Date(timestamp))
        : "-"

      return (
        <div className="text-center">
          <BlockNumber blockNumber={blockNumber} />
          <div className="font-sans text-xs text-body-secondary">
            {formattedTimestamp}
          </div>
        </div>
      )
    },
  },
  // Gas used
  {
    id: "gas_used",
    accessorKey: "gas_used",
    header: () => (
      <ColumnHeader label={<metrics.gasUsed.Label />}>
        <metrics.gasUsed.Details />
        <TooltipContentFooter className="space-y-3">
          <p className="font-bold">percentage of block gas limit</p>
          <Info.Derivation>
            <span className="text-primary-light">gas_used</span> /{" "}
            <span className="text-primary-light">gas_limit</span> x{" "}
            <span className="text-primary-light">100</span>
          </Info.Derivation>
          <p>
            <span className="text-primary-light">gas_used</span> value from
            execution block header
          </p>
          <p>
            <span className="text-primary-light">gas_limit</span> value from
            execution block header
          </p>
        </TooltipContentFooter>
      </ColumnHeader>
    ),
    cell: ({ cell }) => {
      const gasUsed = cell.getValue() as number

      if (!gasUsed) return <Null />

      const formatted = formatNumber(gasUsed)

      const percentGasUsage = (gasUsed / BLOCK_GAS_LIMIT) * 100
      return (
        <>
          <HidePunctuation>{formatted}</HidePunctuation>
          <Progress
            value={percentGasUsage}
            className="mx-auto my-2 h-1.5 max-w-32"
          />
        </>
      )
    },
  },
  // Cost per proof
  {
    id: "cost_per_proof",
    accessorKey: "proofs",
    header: () => (
      <ColumnHeader label={<metrics.costPerProof.Label />}>
        <metrics.costPerProof.Details />
      </ColumnHeader>
    ),
    cell: ({ cell }) => {
      const proofs = cell.getValue() as ProofWithCluster[]

      const stats = getCostPerProofStats(proofs)

      if (!stats) return <Null />

      return <AvgBestMetric stats={stats} />
    },
  },
  // Cost per Mgas
  {
    id: "cost_per_mgas",
    accessorKey: "proofs",
    header: () => (
      <ColumnHeader label={<metrics.costPerMgas.Label />}>
        <metrics.costPerMgas.Details />
      </ColumnHeader>
    ),
    cell: ({ row }) => {
      const { proofs, gas_used } = row.original

      const stats = getCostPerMgasStats(proofs, gas_used)

      if (!stats) return <Null />

      return <AvgBestMetric stats={stats} />
    },
  },
  // Proving time
  {
    id: "proving_time",
    accessorKey: "proofs",
    header: () => (
      <ColumnHeader label={<metrics.provingTime.Label />}>
        <metrics.provingTime.Details />
      </ColumnHeader>
    ),
    cell: ({ cell }) => {
      const proofs = cell.getValue() as ProofWithCluster[]

      const stats = getProvingTimeStats(proofs)

      if (!stats) return <Null />

      return <AvgBestMetric stats={stats} />
    },
  },
  // Total TTP
  {
    id: "proof_status",
    accessorKey: "proofs",
    header: () => (
      <ColumnHeader label="proof status">
        <ProofStatusInfo title="" />
        <TooltipContentFooter className="space-y-3">
          <Info.Label isSecondary>
            <metrics.totalTTP.Label /> (fastest proof shown)
          </Info.Label>
          <metrics.totalTTP.Details />
        </TooltipContentFooter>
      </ColumnHeader>
    ),
    cell: ({ cell, row }) => {
      const proofs = cell.getValue() as ProofWithCluster[]
      const timestamp = row.original.timestamp

      const totalTTPStats = getTotalTTPStats(proofs, timestamp)
      const proofsPerStatusCount = getProofsPerStatusCount(proofs)

      return (
        <div className="flex flex-col justify-center text-center">
          <ProofStatus className="mx-auto" statusCount={proofsPerStatusCount} />
          <div className="whitespace-nowrap text-sm text-body-secondary">
            {totalTTPStats?.bestFormatted ?? <Null />}
          </div>
        </div>
      )
    },
  },
  // Download button / proof status
  {
    id: "download_button",
    accessorKey: "block_number",
    header: "",
    cell: ({ cell }) => {
      const blockNumber = cell.getValue() as number
      return (
        <div className="flex h-12 items-center">
          <ButtonLink
            href={`/blocks/${blockNumber}`}
            variant="outline"
            size="icon"
            className="ms-auto h-auto p-1.5 text-lg"
          >
            <ArrowRight />
          </ButtonLink>
        </div>
      )
    },
  },
]
