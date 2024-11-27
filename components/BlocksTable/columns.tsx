"use client"

import Link from "next/link"
import prettyMilliseconds from "pretty-ms"
import { ColumnDef } from "@tanstack/react-table"

import type { BlockWithProofs, Proof } from "@/lib/types"

import Null from "@/components/Null"
import ArrowRight from "@/components/svgs/arrow-right.svg"
import { ButtonLink } from "@/components/ui/button"

import { cn } from "@/lib/utils"

import { MetricInfo } from "../ui/metric"
import { TooltipContentFooter, TooltipContentHeader } from "../ui/tooltip"

import { formatTimeAgo } from "@/lib/date"
import { formatNumber } from "@/lib/number"
import {
  filterCompleted,
  getProofsAvgCost,
  getProofsAvgLatency,
} from "@/lib/proofs"

const TeamPlaceholderIcon = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex aspect-square size-4 shrink-0 items-center justify-center rounded-full border border-body text-xs",
      className
    )}
    {...props}
  />
)

const getTime = (d: string): number => new Date(d).getTime()

const getStatusClasses = (status: Proof["proof_status"]) => {
  const baseClasses = "inline-block size-2 rounded-full"
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
            className="text-lg tracking-wide hover:text-primary-light hover:underline"
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
    accessorKey: "gas_used",
    header: () => (
      <div className="whitespace-nowrap">
        gas usage
        <MetricInfo className="whitespace-normal">
          <TooltipContentHeader>
            Total gas units executed within block (in millions)
          </TooltipContentHeader>
          <p className="text-body">
            <span className="font-mono text-primary">gas_used</span> value from
            execution block, expressed in millions (
            <span className="font-mono text-primary">gas_used</span> / 10
            <sup>6</sup>)
          </p>
          <p className="text-body-secondary">
            Proportional to the amount of computational effort a block outputs.
            Less gas = less computationally intense = easier to prove.
          </p>
        </MetricInfo>
      </div>
    ),
    cell: ({ cell }) => {
      const gasUsed = cell.getValue() as number

      if (!gasUsed) return <Null />

      const formatted = formatNumber(gasUsed)

      return formatted
    },
  },
  {
    accessorKey: "proofs",
    header: () => (
      <div className="whitespace-nowrap">
        cost per proof
        <MetricInfo className="whitespace-normal">
          <TooltipContentHeader>
            Proving costs in USD for entire proof of block
          </TooltipContentHeader>
          <p className="font-mono text-primary">proving costs (USD)</p>
          <TooltipContentFooter>Average cost (lower cost)</TooltipContentFooter>
        </MetricInfo>
      </div>
    ),
    cell: ({ cell }) => {
      const proofs = cell.getValue() as Proof[]
      if (!proofs.length) return <Null />

      const averageCost = getProofsAvgCost(proofs)

      const { completedProofs } = filterCompleted(proofs)

      if (!completedProofs.length) return <Null />

      const cheapestProof = completedProofs.reduce((acc, p) => {
        if (p.proving_cost! < acc.proving_cost!) return p
        return acc
      }, completedProofs[0])
      if (isNaN(averageCost)) return <Null />

      const cheapestCost = cheapestProof.proving_cost as number

      const formatted = (value: number) =>
        formatNumber(value, {
          style: "currency",
          currency: "USD",
        })

      return (
        <>
          <span className="align-center flex justify-center whitespace-nowrap">
            {formatted(cheapestCost)}
            {/* TODO: Use team and machine information */}
            <MetricInfo
              trigger={
                <TeamPlaceholderIcon>
                  {cheapestProof.user_id[0]}
                </TeamPlaceholderIcon>
              }
            >
              <Link href="#" className="text-primary underline">
                Team {cheapestProof.user_id}
              </Link>
              <span className="block">Machine {cheapestProof.machine_id}</span>
            </MetricInfo>
          </span>
          <span className="block whitespace-nowrap text-sm text-body-secondary">
            avg. {formatted(averageCost)}
          </span>
        </>
      )
    },
  },
  {
    accessorKey: "proofs",
    header: () => (
      <div className="whitespace-nowrap">
        cost per gas
        <MetricInfo className="whitespace-normal">
          <TooltipContentHeader>
            Proving costs in USD per million gas units proven
          </TooltipContentHeader>
          <p className="">
            <span className="font-mono text-primary">proving costs (USD)</span>{" "}
            / <span className="font-mono text-primary">gas_used</span> / 10
            <sup>6</sup>
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
    cell: ({ cell, row }) => {
      const proofs = cell.getValue() as Proof[]
      const gasUsed = row.original.gas_used
      if (!gasUsed || !proofs.length) return <Null />

      const mgasUsed = gasUsed / 1e6

      const averageCost = getProofsAvgCost(proofs)
      if (isNaN(averageCost)) return <Null />

      const { completedProofs } = filterCompleted(proofs)
      if (!completedProofs.length) return <Null />

      const cheapestProof = completedProofs.reduce((acc, p) => {
        if (p.proving_cost! < acc.proving_cost!) return p
        return acc
      }, completedProofs[0])
      const cheapestCost = cheapestProof.proving_cost as number

      const formatted = (numerator: number) =>
        formatNumber(numerator / mgasUsed, {
          style: "currency",
          currency: "USD",
        })

      return (
        <>
          <span className="align-center flex justify-center whitespace-nowrap">
            {formatted(cheapestCost)}
            {/* TODO: Use team and machine information */}
            <MetricInfo
              trigger={
                <TeamPlaceholderIcon>
                  {cheapestProof.user_id[0]}
                </TeamPlaceholderIcon>
              }
            >
              <Link href="#" className="text-primary underline">
                Team {cheapestProof.user_id}
              </Link>
              <span className="block">Machine {cheapestProof.machine_id}</span>
            </MetricInfo>
          </span>
          <span className="block whitespace-nowrap text-sm text-body-secondary">
            avg. {formatted(averageCost)}
          </span>
        </>
      )
    },
  },
  {
    accessorKey: "proofs",
    header: () => (
      <div className="whitespace-nowrap">
        time to proof
        <MetricInfo className="whitespace-normal">
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
    cell: ({ cell, row }) => {
      const proofs = cell.getValue() as Proof[]
      const timestamp = row.original.timestamp

      if (!timestamp || !proofs.length) return <Null />

      const { completedProofs } = filterCompleted(proofs)

      if (!completedProofs.length) return <Null />

      const averageSubmissionTime =
        completedProofs.reduce(
          (acc, p) => acc + getTime(p.proved_timestamp!),
          0
        ) / completedProofs.length

      const fastestProof = completedProofs.reduce((acc, p) => {
        const oldTime = getTime(acc.proved_timestamp!)
        const newTime = getTime(p.proved_timestamp!)
        if (newTime < oldTime) return p
        return acc
      }, completedProofs[0])

      const msDelay = (submissionTime: number) =>
        submissionTime - getTime(timestamp)

      const bestSubmissionTime = getTime(fastestProof.proved_timestamp!)

      const formatted = (ms: number) => {
        if (ms < 0) return "-"
        prettyMilliseconds(ms)
      }

      return (
        <>
          <span className="align-center flex justify-center whitespace-nowrap">
            {formatted(msDelay(bestSubmissionTime))}
            {/* TODO: Use team and machine information */}
            {msDelay(bestSubmissionTime) > 0 && (
              <MetricInfo
                trigger={
                  <TeamPlaceholderIcon>
                    {fastestProof.user_id[0]}
                  </TeamPlaceholderIcon>
                }
              >
                <Link href="#" className="text-primary underline">
                  Team {fastestProof.user_id}
                </Link>
                <span className="block">Machine {fastestProof.machine_id}</span>
              </MetricInfo>
            )}
          </span>
          <span className="block whitespace-nowrap text-sm text-body-secondary">
            avg. {formatted(msDelay(averageSubmissionTime))}
          </span>
        </>
      )
    },
  },
  {
    accessorKey: "proofs",
    header: () => (
      <div className="whitespace-nowrap">
        proof status
        <MetricInfo className="whitespace-normal">
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
    cell: ({ cell, row }) => {
      const blockNumber = row.original.block_number

      const proofs = cell.getValue() as Proof[]

      if (!proofs.length) return <Null />

      const { completedProofs } = filterCompleted(proofs)

      const getBestLatency = () => {
        if (!completedProofs.length) return "-"

        const fastestProof = completedProofs.reduce((acc, p) => {
          const oldLatency = acc.proof_latency!
          const newLatency = p.proof_latency!
          if (newLatency < oldLatency) return p
          return acc
        }, completedProofs[0])

        return prettyMilliseconds(fastestProof.proof_latency! * 1e3)
      }

      const getAverageLatency = () => {
        if (!completedProofs.length) return "-"
        return prettyMilliseconds(getProofsAvgLatency(completedProofs) * 1e3)
      }

      return (
        <div className="mx-auto flex w-40 items-center gap-x-4">
          <div className="flex flex-1 flex-col gap-2">
            <div className="flex flex-wrap gap-2">
              {proofs.map((proof) => (
                <div
                  key={proof.proof_id}
                  className={getStatusClasses(proof.proof_status)}
                  title={proof.proof_status}
                />
              ))}
            </div>

            <div className="whitespace-nowrap text-start font-sans text-xs text-body-secondary">
              latency {getBestLatency()}
              <br />
              avg. {getAverageLatency()}
            </div>
          </div>
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
