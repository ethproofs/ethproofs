"use client"

import Link from "next/link"
import { ColumnDef } from "@tanstack/react-table"

import type { Block, Cluster, Proof, Team } from "@/lib/types"

import { ColumnHeader } from "@/components/ColumnHeader"
import DownloadButton from "@/components/DownloadButton"
import { metrics } from "@/components/Metrics"
import Null from "@/components/Null"
import Cpu from "@/components/svgs/cpu.svg"
import { MetricInfo } from "@/components/ui/metric"
import { TooltipContentHeader } from "@/components/ui/tooltip"

import { formatUsd } from "@/lib/number"
import { getProvingCost, hasCostInfo, isCompleted } from "@/lib/proofs"
import { prettyMs } from "@/lib/time"

export const columns: ColumnDef<Proof>[] = [
  // Prover
  {
    id: "prover",
    accessorKey: "team",
    header: "",
    cell: ({ cell }) => {
      const team = cell.getValue() as Team

      return (
        <Link
          href={"/prover/" + team?.team_id}
          className="text-2xl hover:text-primary-light hover:underline"
        >
          {team.team_name}
        </Link>
      )
    },
  },
  // Proving time
  {
    id: "proving_time",
    accessorKey: "proving_time",
    header: () => (
      <ColumnHeader label={<metrics.provingTime.Label />}>
        <metrics.provingTime.Details />
      </ColumnHeader>
    ),
    cell: ({ cell, row }) => {
      const provingTime = cell.getValue() as number
      const proof = row.original

      if (!isCompleted(proof) || !proof.block) return <Null />

      const formatted = prettyMs(provingTime)

      return formatted
    },
  },
  // Total TTP
  {
    id: "total_time_to_proof",
    accessorKey: "proved_timestamp",
    header: () => (
      <ColumnHeader label={<metrics.totalTTP.Label />}>
        <metrics.totalTTP.Details />
      </ColumnHeader>
    ),
    cell: ({ cell, row }) => {
      const provedTimestamp = cell.getValue() as string
      const proof = row.original

      if (!isCompleted(proof) || !proof.block) return <Null />

      const blockTimestamp = proof.block.timestamp

      const diff =
        new Date(provedTimestamp).getTime() - new Date(blockTimestamp).getTime()

      const formatted = diff > 0 ? prettyMs(diff) : <Null />

      return formatted
    },
  },
  // Cluster
  {
    id: "cluster",
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
  // Cost per proof
  {
    id: "cost_per_proof",
    header: () => (
      <ColumnHeader label={<metrics.costPerProof.Label />}>
        <metrics.costPerProof.Details />
      </ColumnHeader>
    ),
    cell: ({ row }) => {
      const proof = row.original

      if (!proof || !hasCostInfo(proof)) return <Null />

      const costPerProof = getProvingCost(proof)!
      console.log({ costPerProofInsideCol: costPerProof })

      const formatted = formatUsd(costPerProof)

      return formatted
    },
  },
  // Cost per Mgas
  {
    id: "cost_per_mgas",
    accessorKey: "block",
    header: () => (
      <ColumnHeader label={<metrics.costPerMgas.Label />}>
        <metrics.costPerMgas.Details />
      </ColumnHeader>
    ),
    cell: ({ cell, row }) => {
      const block = cell.getValue() as Block
      const proof = row.original

      if (!proof || !hasCostInfo(proof) || !block?.gas_used) return <Null />

      const costPerProof = getProvingCost(proof)!
      const costPerMgas = costPerProof / block.gas_used / 1e6

      const formatted = formatUsd(costPerMgas)

      return formatted
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
