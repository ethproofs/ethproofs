"use client"

import Link from "next/link"
import { ColumnDef } from "@tanstack/react-table"

import type { Block, Cluster, Proof } from "@/lib/types"

import { primitives } from "@/components/Definitions"
import DownloadButton from "@/components/DownloadButton"
import { metrics } from "@/components/Metrics"
import Null from "@/components/Null"
import { HidePunctuation } from "@/components/StylePunctuation"
import Cpu from "@/components/svgs/cpu.svg"
import Tooltip from "@/components/Tooltip"
import * as Info from "@/components/ui/info"
import { MetricInfo } from "@/components/ui/metric"
import { TooltipContentHeader } from "@/components/ui/tooltip"

import { ColumnHeader } from "./ColumnHeader"

import { formatTimeAgo } from "@/lib/date"
import { formatNumber, formatUsd } from "@/lib/number"
import {
  getProvingCost,
  hasCostInfo,
  hasProvedTimestamp,
  hasProvingTime,
  isCompleted,
} from "@/lib/proofs"
import { prettyMs } from "@/lib/time"

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
    cell: ({ cell, row }) => {
      const blockNumber = cell.getValue() as number
      const timestamp = row.original.block?.timestamp as string

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
  // Cluster (cycle type)
  {
    accessorKey: "cluster",
    header: () => (
      <ColumnHeader label={<metrics.cluster.Label />}>
        <metrics.cluster.Details />
      </ColumnHeader>
    ),
    cell: ({ cell }) => {
      const cluster = cell.getValue() as Cluster

      // TODO: Add Equivalents for cluster_id by it's instance_type_id (inside cluster_configurations)

      return (
        <>
          <MetricInfo
            trigger={
              <div className="flex items-center gap-1">
                {cluster.nickname}
                <Cpu />
              </div>
            }
          >
            <TooltipContentHeader>{cluster.nickname}</TooltipContentHeader>
            <div className="space-y-2">
              {cluster.hardware && <p>Hardware: {cluster.hardware}</p>}
              {cluster.cycle_type && <p>Cycle type: {cluster.cycle_type}</p>}
              {cluster.description && <p>{cluster.description}</p>}
            </div>
          </MetricInfo>
          <span className="block whitespace-nowrap text-sm text-body-secondary">
            cycle type: {cluster.cycle_type}
          </span>
        </>
      )
    },
  },
  // Timing (Proving time / Time to proof)
  {
    accessorKey: "proved_timestamp",
    header: () => (
      <ColumnHeader label="time">
        <>
          <Info.Derivation>
            <primitives.proofSubmissionTime.Term /> -{" "}
            <primitives.timestamp.Term />
          </Info.Derivation>

          <primitives.proofSubmissionTime.Definition />
          <primitives.timestamp.Definition />
        </>
      </ColumnHeader>
    ),
    cell: ({ cell, row }) => {
      const provedTimestamp = cell.getValue() as string
      const proof = row.original

      const blockTimestamp = proof.block?.timestamp
      const provingTime = proof.proving_time!

      if (
        !proof ||
        !isCompleted(proof) ||
        !hasProvedTimestamp(proof) ||
        !hasProvingTime(proof) ||
        !provedTimestamp ||
        !blockTimestamp
      )
        return <Null />

      const formattedProvingTime = prettyMs(provingTime)

      const diff =
        new Date(provedTimestamp).getTime() - new Date(blockTimestamp).getTime()

      const formattedTotalTTP = diff > 0 ? prettyMs(diff) : <Null />

      return (
        <>
          <span className="align-center flex justify-center whitespace-nowrap">
            proving: {formattedProvingTime}
          </span>
          <span className="block whitespace-nowrap text-sm text-body-secondary">
            total to proof: {formattedTotalTTP}
          </span>
        </>
      )
    },
  },
  // Costs (cost per proof and cost per Mgas)
  {
    accessorKey: "block",
    header: () => (
      <ColumnHeader label="costs">
        <>
          <Info.Derivation>
            <primitives.proofSubmissionTime.Term /> -{" "}
            <primitives.timestamp.Term />
          </Info.Derivation>

          <primitives.proofSubmissionTime.Definition />
          <primitives.timestamp.Definition />
        </>
      </ColumnHeader>
    ),
    cell: ({ cell, row }) => {
      const { gas_used } = cell.getValue() as Block
      const proof = row.original

      if (!proof || !hasCostInfo(proof) || !gas_used || !isCompleted(proof))
        return <Null />

      const costPerProof = getProvingCost(proof)!
      const formattedCostPerProof = formatUsd(costPerProof)

      const costPerMgas = costPerProof / gas_used / 1e6
      const formattedCostPerMgas = formatUsd(costPerMgas)

      return (
        <>
          <span className="align-center flex justify-center whitespace-nowrap">
            per proof: {formattedCostPerProof}
          </span>
          <span className="block whitespace-nowrap text-sm text-body-secondary">
            per Mgas: {formattedCostPerMgas}
          </span>
        </>
      )
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
