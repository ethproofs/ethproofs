"use client"

import Link from "next/link"
import { ColumnDef } from "@tanstack/react-table"

import type { BlockWithProofs, Proof } from "@/lib/types"

import { cn } from "@/lib/utils"

import { MetricInfo } from "../ui/metric"
import { TooltipContentFooter, TooltipContentHeader } from "../ui/tooltip"

import { formatTimeAgo } from "@/lib/date"
import { formatNumber } from "@/lib/number"
import { getProofsAvgCost, getProofsAvgLatency } from "@/lib/proofs"

const Null = () => <span className="text-body-secondary">{"-"}</span>

const getStatusClasses = (status: Proof["proof_status"]) => {
  const baseClasses = "inline-block size-2 rounded-full" // me-2
  if (status === "proved") return cn(baseClasses, "bg-primary")
  if (status === "queued")
    return cn(
      baseClasses,
      "bg-transparent outline outline-1 -outline-offset-1 outline-body-secondary"
    )
  if (status === "proving") return cn(baseClasses, "bg-body-secondary")
  return cn(baseClasses, "bg-red-500")
}

export const columns: ColumnDef<BlockWithProofs>[] = [
  {
    accessorKey: "block_number",
    header: () => (
      <div className="text-left">
        block
        <MetricInfo>
          <TooltipContentHeader>Block height number</TooltipContentHeader>
          <p className="text-body">
            <span className="font-mono text-primary">block_number</span> value
            from execution block
          </p>
          <p className="text-body-secondary">
            Includes time since block published
          </p>
        </MetricInfo>
      </div>
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
            className="hover:text-primary-light hover:underline"
          >
            {blockNumber}
          </Link>
          <div className="font-sans text-xs text-body-secondary">
            {formattedTimestamp}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "transaction_count",
    header: () => (
      <div>
        gas usage
        <MetricInfo>
          <TooltipContentHeader>
            Total gas units executed within block
          </TooltipContentHeader>
          <p className="text-body">
            <span className="font-mono text-primary">gas_used</span> value from
            execution block
          </p>
          <p className="text-body-secondary">
            Proportional to the amount of computational effort a block outputs.
            Less gas = less computationally intense = easier to prove.
          </p>
        </MetricInfo>
      </div>
    ),
    cell: ({ cell }) => {
      const transactionCount = cell.getValue() as number

      if (!transactionCount) return <Null />

      const formatted = formatNumber(transactionCount)

      return formatted
    },
  },
  {
    header: () => (
      <div>
        cost per gas
        <MetricInfo>
          <TooltipContentHeader>
            Proving costs in USD, on a per-gas-unit basis
          </TooltipContentHeader>
          <p className="font-mono text-primary">
            Total USD cost to produce proof / Total gas units proven
          </p>
          <p className="text-body-secondary">
            Normalized USD cost per gas unit to allow comparison amongst proofs
            of different sized blocks. More gas consumption in a block means
            more computation to prove.
          </p>
          <TooltipContentFooter>
            Average cost (lowest cost)
          </TooltipContentFooter>
        </MetricInfo>
      </div>
    ),
    accessorKey: "total_fees",
    cell: ({ cell }) => {
      const totalFeesGwei = cell.getValue() as number

      if (!totalFeesGwei) return <Null />

      const formatted = formatNumber(totalFeesGwei)

      return formatted
    },
  },
  {
    accessorKey: "proofs",
    header: () => (
      <div>
        cost per proof
        <MetricInfo>
          <TooltipContentHeader>
            Proving costs in USD for entire proof of block
          </TooltipContentHeader>
          <p className="font-mono text-primary">
            Total USD cost to produce proof
          </p>
          <TooltipContentFooter>Average cost (lower cost)</TooltipContentFooter>
        </MetricInfo>
      </div>
    ),
    cell: ({ cell }) => {
      const proofs = cell.getValue() as Proof[]
      if (!proofs.length) return <Null />

      const avgCostPerProof = getProofsAvgCost(proofs)

      if (isNaN(avgCostPerProof)) return <Null />

      const formatted = formatNumber(avgCostPerProof, {
        style: "currency",
        currency: "USD",
      })

      return formatted
    },
  },
  {
    id: "ttp",
    header: () => (
      <div>
        time to proof
        <MetricInfo>
          <TooltipContentHeader>Total time to proof</TooltipContentHeader>
          <p className="font-mono text-primary">
            Time between slot timestamp and when proof published
          </p>
          <TooltipContentFooter>
            Average time (fastest time)
          </TooltipContentFooter>
        </MetricInfo>
      </div>
    ),
    cell: "69s",
  },
  {
    accessorKey: "proofs",
    header: () => (
      <div>
        proof status
        <MetricInfo>
          <TooltipContentHeader>
            Current status of proofs for this block
          </TooltipContentHeader>
          <div className="items-top grid grid-cols-[auto,1fr] gap-4">
            <div className="flex h-fit items-center gap-2">
              <div className={getStatusClasses("queued")} />
              <span className="font-mono text-body">queued</span>
            </div>
            <div className="text-body-secondary">
              Prover has indicated intent to prove this block
            </div>
            <div className="flex h-fit items-center gap-2">
              <div className={getStatusClasses("proving")} />
              <span className="font-mono text-body">proving</span>
            </div>
            <div className="text-body-secondary">
              Work has begun proving this block
            </div>
            <div className="flex h-fit items-center gap-2">
              <div className={getStatusClasses("proved")} />
              <span className="font-mono text-body">proved</span>
            </div>
            <div className="text-body-secondary">
              Proof completed and published
            </div>
          </div>
        </MetricInfo>
      </div>
    ),
    cell: ({ cell }) => {
      const proofs = cell.getValue() as Proof[]

      const latency = getProofsAvgLatency(proofs)

      return (
        <div className="mx-auto flex w-20">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-2">
              {proofs.map((proof) => (
                <div
                  key={proof.proof_id}
                  className={getStatusClasses(proof.proof_status)}
                />
              ))}
            </div>
            {latency > 0 && (
              <div className="whitespace-nowrap font-sans text-xs text-body-secondary">
                latency {latency.toFixed(0)}s
              </div>
            )}
          </div>
        </div>
      )
    },
  },
]
