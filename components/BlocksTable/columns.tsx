"use client"

import Link from "next/link"
import prettyMilliseconds from "pretty-ms"
import { ColumnDef } from "@tanstack/react-table"

import type { BlockWithProofs, Proof } from "@/lib/types"

import Null from "@/components/Null"
import ArrowRight from "@/components/svgs/arrow-right.svg"
import Award from "@/components/svgs/award.svg"
import Box from "@/components/svgs/box.svg"
import BoxDashed from "@/components/svgs/box-dashed.svg"
import { ButtonLink } from "@/components/ui/button"

import { cn } from "@/lib/utils"

import { BLOCK_GAS_LIMIT, SITE_NAME } from "@/lib/constants"

import ProofStatus, { ProofStatusInfo } from "../ProofStatus"
import { HidePunctuation } from "../StylePunctuation"
import { MetricInfo } from "../ui/metric"
import { Progress } from "../ui/progress"
import { TooltipContentFooter, TooltipContentHeader } from "../ui/tooltip"

import ClusterDetails from "./ClusterDetails"
import TeamName from "./TeamName"

import { formatTimeAgo } from "@/lib/date"
import { formatNumber } from "@/lib/number"
import {
  filterCompleted,
  getProofsAvgCost,
  getProofsAvgLatency,
} from "@/lib/proofs"

const getTime = (d: string): number => new Date(d).getTime()

export const columns: ColumnDef<BlockWithProofs>[] = [
  {
    accessorKey: "block_number",
    header: () => {
      const columnLabel = "block"
      return (
        <div className="text-left">
          {columnLabel}
          <MetricInfo className="space-y-3">
            <TooltipContentHeader>{columnLabel}</TooltipContentHeader>
            <div className="rounded border bg-background px-3 py-2">
              <span className="font-mono text-primary">block_number</span>
            </div>
            <p>
              <span className="font-mono text-primary">block_number</span> value
              from execution block header
            </p>
            <p className="text-body-secondary">Block height number</p>
            <TooltipContentFooter className="space-y-3">
              <p className="font-bold">Time since block published</p>
              <div className="rounded border bg-background px-3 py-2">
                <span className="font-mono text-primary-light">now</span> -{" "}
                <span className="font-mono text-primary-light">timestamp</span>
              </div>
              <p>
                <span className="font-mono text-primary-light">timestamp</span>{" "}
                value from execution block header
              </p>
            </TooltipContentFooter>
          </MetricInfo>
        </div>
      )
    },
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
  {
    accessorKey: "gas_used",
    header: () => {
      const columnLabel = "gas usage"
      return (
        <div className="space-y-3 whitespace-nowrap">
          {columnLabel}
          <MetricInfo className="whitespace-normal">
            <TooltipContentHeader>{columnLabel}</TooltipContentHeader>
            <div className="rounded border bg-background px-3 py-2">
              <span className="font-mono text-primary">gas_used</span>
            </div>
            <p>
              <span className="font-mono text-primary">gas_used</span> value
              from execution block header
            </p>
            <p className="text-body-secondary">
              Total gas units executed within block
            </p>
            <p className="text-body-secondary">
              Proportional to the amount of computational effort a block
              outputs. Less gas = less computationally intense = easier to
              prove.
            </p>
            <TooltipContentFooter className="space-y-3">
              <p className="font-bold">Percentage of block gas limit</p>
              <div className="rounded border bg-background px-3 py-2">
                <span className="font-mono text-primary-light">gas_used</span> /{" "}
                <span className="font-mono text-primary-light">gas_limit</span>{" "}
                x <span className="font-mono text-primary-light">100</span>
              </div>
              <p>
                <span className="font-mono text-primary-light">gas_used</span>{" "}
                value from execution block header
              </p>
              <p>
                <span className="font-mono text-primary-light">gas_limit</span>{" "}
                value from execution block header
              </p>
            </TooltipContentFooter>
          </MetricInfo>
        </div>
      )
    },
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
  {
    accessorKey: "proofs",
    header: () => {
      const columnLabel = "cost per proof"
      return (
        <div className="whitespace-nowrap">
          {columnLabel}
          <MetricInfo className="space-y-3 whitespace-normal">
            <TooltipContentHeader>{columnLabel}</TooltipContentHeader>
            <div className="rounded border bg-background px-3 py-2">
              <span className="italic">proving costs</span>
            </div>
            <p>
              <span className="italic">proving costs</span> are in USD,
              self-reported by proving teams
            </p>
            <p className="text-body-secondary">
              Proving costs in USD to prove entire block
            </p>
          </MetricInfo>
        </div>
      )
    },
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
            <MetricInfo
              trigger={
                <Award className="text-primary hover:text-primary-light" />
              }
            >
              <TeamName proof={cheapestProof} />
              <ClusterDetails proof={cheapestProof} />
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
    header: () => {
      const columnLabel = "cost per gas"
      return (
        <div className="whitespace-nowrap">
          {columnLabel}
          <MetricInfo className="whitespace-normal">
            <TooltipContentHeader>{columnLabel}</TooltipContentHeader>
            <div className="rounded border bg-background px-3 py-2">
              <span className="italic">proving costs</span> /{" "}
              <span className="font-mono text-primary">gas_used</span> /{" "}
              <span className="font-mono text-primary">
                10
                <sup>6</sup>
              </span>
            </div>

            <p>
              <span className="italic">proving costs</span> are in USD,
              self-reported by proving teams
            </p>
            <p>
              <span className="font-mono text-primary">gas_used</span> value
              from execution block header, expressed in millions
            </p>
            <p className="text-body-secondary">
              Proving costs in USD per million gas units proven
            </p>
            <p className="text-body-secondary">
              Normalized USD cost per gas unit to allow comparison amongst
              proofs of different sized blocks. More gas consumption in a block
              means more computation to prove.
            </p>
          </MetricInfo>
        </div>
      )
    },
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
            <MetricInfo
              trigger={
                <Award className="text-primary hover:text-primary-light" />
              }
            >
              <TeamName proof={cheapestProof} />
              <ClusterDetails proof={cheapestProof} />
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
    header: () => {
      const columnLabel = "proving time"
      return (
        <div className="whitespace-nowrap">
          {columnLabel}
          <MetricInfo className="space-y-3 whitespace-normal">
            <TooltipContentHeader>{columnLabel}</TooltipContentHeader>
            <div className="rounded border bg-background px-3 py-2">
              <span className="italic">proof latency</span>
            </div>
            <p>
              <span className="italic">proof latency</span> is duration of the
              proof generation process, self reported by proving teams
            </p>
            <p className="text-body-secondary">
              Time spent generating proof of execution
            </p>
          </MetricInfo>
        </div>
      )
    },
    cell: ({ cell, row }) => {
      const proofs = cell.getValue() as Proof[]
      const timestamp = row.original.timestamp

      if (!timestamp || !proofs.length) return <Null />

      const { completedProofs } = filterCompleted(proofs)

      if (!completedProofs.length) return <Null />

      const reduceFastest = (completedProofs: Proof[]) =>
        completedProofs.reduce((acc, p) => {
          const oldTime = getTime(acc.proved_timestamp!)
          const newTime = getTime(p.proved_timestamp!)
          if (newTime < oldTime) return p
          return acc
        }, completedProofs[0])

      const fastestProof = reduceFastest(completedProofs)

      const getBestLatency = () => {
        if (!completedProofs.length) return <Null />

        return prettyMilliseconds(fastestProof.proving_time!)
      }

      const getAverageLatency = () => {
        const avgLatency = getProofsAvgLatency(completedProofs)
        if (!avgLatency) return <Null />
        return prettyMilliseconds(avgLatency)
      }

      return (
        <>
          <span className="align-center flex justify-center whitespace-nowrap">
            {getBestLatency()}
            <MetricInfo
              trigger={
                <Award className="text-primary hover:text-primary-light" />
              }
            >
              <TeamName proof={fastestProof} />
              <ClusterDetails proof={fastestProof} />
            </MetricInfo>
          </span>
          <span className="block whitespace-nowrap text-sm text-body-secondary">
            avg. {getAverageLatency()}
          </span>
        </>
      )
    },
  },
  {
    accessorKey: "proofs",
    header: () => {
      const columnLabel = "proof status"
      return (
        <div className="whitespace-nowrap">
          {columnLabel}
          <MetricInfo className="whitespace-normal">
            <ProofStatusInfo />
            <TooltipContentFooter className="space-y-3">
              <p className="font-bold">Time to proof (fastest proof shown)</p>
              <div className="rounded border bg-background px-3 py-2">
                <span className="italic">proof submission time</span> -{" "}
                <span className="font-mono text-primary-light">timestamp</span>
              </div>
              <p>
                <span className="italic">proof submission time</span> is the
                timestamp logged by {SITE_NAME} when a completed proof has been
                submitted
              </p>
              <p>
                <span className="font-mono text-primary-light">timestamp</span>{" "}
                value from execution block header
              </p>
            </TooltipContentFooter>
          </MetricInfo>
        </div>
      )
    },
    cell: ({ cell, row }) => {
      const proofs = cell.getValue() as Proof[]
      const timestamp = row.original.timestamp

      if (!timestamp || !proofs.length) return <Null />

      const { completedProofs } = filterCompleted(proofs)

      const fastestProof =
        completedProofs?.reduce((acc, p) => {
          const oldTime = getTime(acc.proved_timestamp!)
          const newTime = getTime(p.proved_timestamp!)
          if (newTime < oldTime) return p
          return acc
        }, completedProofs[0]) || {}

      const msAfterBlock = (submissionTime: number) =>
        submissionTime - getTime(timestamp)

      const earliestSubmissionTime = fastestProof?.proved_timestamp
        ? getTime(fastestProof.proved_timestamp)
        : null

      const formatted = (ms: number) => {
        if (ms < 0) return <Null />
        prettyMilliseconds(ms)
      }

      return (
        <div className="flex flex-col justify-center text-center">
          <ProofStatus className="mx-auto" proofs={proofs} />
          <div className="whitespace-nowrap text-xs text-body-secondary">
            <span className="font-body">time to proof:</span>{" "}
            {earliestSubmissionTime
              ? formatted(msAfterBlock(earliestSubmissionTime))
              : "-"}
          </div>
        </div>
      )
    },
  },
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
