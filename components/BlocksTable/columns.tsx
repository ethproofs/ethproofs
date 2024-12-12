"use client"

import Link from "next/link"
import { ColumnDef } from "@tanstack/react-table"

import type { Block, Proof } from "@/lib/types"

import { metrics } from "@/components/Metrics"
import Null from "@/components/Null"
import ArrowRight from "@/components/svgs/arrow-right.svg"
import Award from "@/components/svgs/award.svg"
import { ButtonLink } from "@/components/ui/button"
import * as Info from "@/components/ui/info"

import { cn } from "@/lib/utils"

import { AVERAGE_LABEL, BLOCK_GAS_LIMIT } from "@/lib/constants"

import ProofStatus, { ProofStatusInfo } from "../ProofStatus"
import { HidePunctuation } from "../StylePunctuation"
import { MetricInfo } from "../ui/metric"
import { Progress } from "../ui/progress"
import { TooltipContentFooter } from "../ui/tooltip"

import ClusterDetails from "./ClusterDetails"
import TeamName from "./TeamName"

import { ColumnHeader } from "@/app/prover/[teamId]/ColumnHeader"
import { formatTimeAgo } from "@/lib/date"
import { formatNumber } from "@/lib/number"
import {
  getCostPerMgasStats,
  getCostPerProofStats,
  getProvingTimeStats,
  getTotalTTPStats,
} from "@/lib/proofs"

export const columns: ColumnDef<Block>[] = [
  // Block
  {
    accessorKey: "block_number",
    header: () => (
      <ColumnHeader label={<metrics.blockNumber.Label />} className="text-left">
        <metrics.blockNumber.Details />
        <TooltipContentFooter className="space-y-3">
          <p className="font-bold">Time since block published</p>
          <Info.Derivation>
            <span className="font-mono text-primary-light">now</span> -{" "}
            <span className="font-mono text-primary-light">timestamp</span>
          </Info.Derivation>
          <p>
            <span className="font-mono text-primary-light">timestamp</span>{" "}
            value from execution block header
          </p>
        </TooltipContentFooter>
      </ColumnHeader>
    ),
    cell: ({ row, cell }) => {
      const blockNumber = cell.getValue() as number

      const timestamp = row.original.timestamp
      const formattedTimestamp = timestamp
        ? formatTimeAgo(new Date(timestamp))
        : "pending"

      return (
        <div className="text-start">
          <Link
            href={`/block/${blockNumber}`}
            className="text-lg tracking-wide hover:text-primary-light hover:underline"
          >
            <HidePunctuation>{formatNumber(blockNumber)}</HidePunctuation>
          </Link>
          <div className="font-sans text-xs text-body-secondary">
            {formattedTimestamp}
          </div>
        </div>
      )
    },
  },
  // Gas used
  {
    accessorKey: "gas_used",
    header: () => (
      <ColumnHeader label={<metrics.gasUsed.Label />}>
        <metrics.gasUsed.Details />
        <TooltipContentFooter className="space-y-3">
          <p className="font-bold">Percentage of block gas limit</p>
          <Info.Derivation>
            <span className="font-mono text-primary-light">gas_used</span> /{" "}
            <span className="font-mono text-primary-light">gas_limit</span> x{" "}
            <span className="font-mono text-primary-light">100</span>
          </Info.Derivation>
          <p>
            <span className="font-mono text-primary-light">gas_used</span> value
            from execution block header
          </p>
          <p>
            <span className="font-mono text-primary-light">gas_limit</span>{" "}
            value from execution block header
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
            className={cn(
              percentGasUsage < 50 && "[&>div]:bg-primary-light",
              "mx-auto my-2 h-1 max-w-32"
            )}
          />
        </>
      )
    },
  },
  // Cost per proof
  {
    accessorKey: "proofs",
    header: () => (
      <ColumnHeader label={<metrics.costPerProof.Label />}>
        <metrics.costPerProof.Details />
      </ColumnHeader>
    ),
    cell: ({ cell }) => {
      const proofs = cell.getValue() as Proof[]

      const costPerProofStats = getCostPerProofStats(proofs)

      if (!costPerProofStats) return <Null />

      const { avgFormatted, bestFormatted, bestProof } = costPerProofStats

      return (
        <>
          <span className="align-center flex justify-center whitespace-nowrap">
            <MetricInfo
              trigger={
                <div className="flex items-center gap-1">
                  {bestFormatted}
                  <Award className="text-primary hover:text-primary-light" />
                </div>
              }
            >
              <TeamName proof={bestProof} />
              <ClusterDetails proof={bestProof} />
            </MetricInfo>
          </span>
          <span className="block whitespace-nowrap text-sm text-body-secondary">
            {AVERAGE_LABEL} {avgFormatted}
          </span>
        </>
      )
    },
  },
  // Cost per Mgas
  {
    accessorKey: "proofs",
    header: () => (
      <ColumnHeader label={<metrics.costPerMgas.Label />}>
        <metrics.costPerMgas.Details />
      </ColumnHeader>
    ),
    cell: ({ row }) => {
      const { proofs, gas_used } = row.original

      const costPerMgasStats = getCostPerMgasStats(proofs, gas_used)

      if (!costPerMgasStats) return <Null />

      const { avgFormatted, bestFormatted, bestProof } = costPerMgasStats

      return (
        <>
          <span className="align-center flex justify-center whitespace-nowrap">
            {bestFormatted}
            <MetricInfo
              trigger={
                <Award className="text-primary hover:text-primary-light" />
              }
            >
              <TeamName proof={bestProof} />
              <ClusterDetails proof={bestProof} />
            </MetricInfo>
          </span>
          <span className="block whitespace-nowrap text-sm text-body-secondary">
            {AVERAGE_LABEL} {avgFormatted}
          </span>
        </>
      )
    },
  },
  // Proving time
  {
    accessorKey: "proofs",
    header: () => (
      <ColumnHeader label={<metrics.provingTime.Label />}>
        <metrics.provingTime.Details />
      </ColumnHeader>
    ),
    cell: ({ cell }) => {
      const proofs = cell.getValue() as Proof[]

      const provingTimeStats = getProvingTimeStats(proofs)

      if (!provingTimeStats) return <Null />

      const { bestFormatted, avgFormatted, bestProof } = provingTimeStats

      return (
        <>
          <span className="align-center flex justify-center whitespace-nowrap">
            {bestFormatted}
            <MetricInfo
              trigger={
                <Award className="text-primary hover:text-primary-light" />
              }
            >
              <TeamName proof={bestProof} />
              <ClusterDetails proof={bestProof} />
            </MetricInfo>
          </span>
          <span className="block whitespace-nowrap text-sm text-body-secondary">
            {AVERAGE_LABEL} {avgFormatted}
          </span>
        </>
      )
    },
  },
  // Total TTP
  {
    accessorKey: "proofs",
    header: () => (
      <ColumnHeader label={<metrics.totalTTP.Label />}>
        <ProofStatusInfo />
        <TooltipContentFooter className="space-y-3">
          <Info.Label isSecondary>
            <metrics.totalTTP.Label /> (fastest proof shown)
          </Info.Label>
          <metrics.totalTTP.Details />
        </TooltipContentFooter>
      </ColumnHeader>
    ),
    cell: ({ cell, row }) => {
      const proofs = cell.getValue() as Proof[]
      const timestamp = row.original.timestamp

      const totalTTPStats = getTotalTTPStats(proofs, timestamp)

      return (
        <div className="flex flex-col justify-center text-center">
          <ProofStatus className="mx-auto" proofs={proofs} />
          <div className="whitespace-nowrap text-xs text-body-secondary">
            <span className="font-body">
              <metrics.totalTTP.Label />:
            </span>{" "}
            {totalTTPStats?.bestFormatted ?? <Null />}
          </div>
        </div>
      )
    },
  },
  // Download button / proof status
  {
    accessorKey: "block_number",
    header: "",
    cell: ({ cell }) => {
      const blockNumber = cell.getValue() as number
      return (
        <div className="flex h-12 items-center">
          <ButtonLink
            href={`/block/${blockNumber}`}
            variant="outline"
            size="icon"
            className="ms-auto"
          >
            <ArrowRight />
          </ButtonLink>
        </div>
      )
    },
  },
]
