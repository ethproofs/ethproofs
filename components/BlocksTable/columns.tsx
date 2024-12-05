"use client"

import Link from "next/link"
import prettyMilliseconds from "pretty-ms"
import { ColumnDef } from "@tanstack/react-table"

import type { BlockWithProofs, Proof } from "@/lib/types"

import * as Metrics from "@/components/Metrics"
import Null from "@/components/Null"
import ArrowRight from "@/components/svgs/arrow-right.svg"
import Award from "@/components/svgs/award.svg"
import { ButtonLink } from "@/components/ui/button"
import * as Info from "@/components/ui/info"

import { cn } from "@/lib/utils"

import { BLOCK_GAS_LIMIT } from "@/lib/constants"

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
  getProofsAvgProvingTime,
} from "@/lib/proofs"

const getTime = (d: string): number => new Date(d).getTime()

export const columns: ColumnDef<BlockWithProofs>[] = [
  {
    accessorKey: "block_number",
    header: () => (
      <div className="text-left">
        {Metrics.BLOCK_NUMBER_LABEL}
        <MetricInfo className="space-y-3">
          <Info.Label>{Metrics.BLOCK_NUMBER_LABEL}</Info.Label>
          <Metrics.BlockNumberDetails />
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
            <Info.Derivation>
              <Info.Term type="codeTerm">gas_used</Info.Term>
            </Info.Derivation>
            <p>
              <Info.Term type="codeTerm">gas_used</Info.Term> value from
              execution block header
            </p>
            <Info.Description>
              Total gas units executed within block
            </Info.Description>
            <Info.Description>
              Proportional to the amount of computational effort a block
              outputs. Less gas = less computationally intense = easier to
              prove.
            </Info.Description>
            <TooltipContentFooter className="space-y-3">
              <p className="font-bold">Percentage of block gas limit</p>
              <Info.Derivation>
                <span className="font-mono text-primary-light">gas_used</span> /{" "}
                <span className="font-mono text-primary-light">gas_limit</span>{" "}
                x <span className="font-mono text-primary-light">100</span>
              </Info.Derivation>
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
            <Info.Derivation>
              <Info.Term type="internal">proving costs</Info.Term>
            </Info.Derivation>
            <p>
              <Info.Term type="internal">proving costs</Info.Term> are in USD,
              self-reported by proving teams
            </p>
            <Info.Description>
              Proving costs in USD to prove entire block
            </Info.Description>
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
            <Info.Derivation>
              <Info.Term type="internal">proving costs</Info.Term> /{" "}
              <Info.Term type="codeTerm">gas_used</Info.Term> /{" "}
              <Info.Term type="codeTerm">
                10
                <sup>6</sup>
              </Info.Term>
            </Info.Derivation>

            <p>
              <Info.Term type="internal">proving costs</Info.Term> are in USD,
              self-reported by proving teams
            </p>
            <p>
              <Info.Term type="codeTerm">gas_used</Info.Term> value from
              execution block header, expressed in millions
            </p>
            <Info.Description>
              Proving costs in USD per million gas units proven
            </Info.Description>
            <Info.Description>
              Normalized USD cost per gas unit to allow comparison amongst
              proofs of different sized blocks. More gas consumption in a block
              means more computation to prove.
            </Info.Description>
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
    header: () => (
      <div className="whitespace-nowrap">
        {Metrics.PROVING_TIME_LABEL}
        <MetricInfo className="space-y-3 whitespace-normal">
          <Info.Label>{Metrics.PROVING_TIME_LABEL}</Info.Label>
          <Metrics.ProvingTimeDetails />
        </MetricInfo>
      </div>
    ),
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

      const getBestProvingTime = () => {
        if (
          !completedProofs.length ||
          fastestProof.proving_time === null ||
          !isFinite(fastestProof.proving_time)
        )
          return <Null />
        return prettyMilliseconds(fastestProof.proving_time!)
      }

      const getAverageProvingTime = () => {
        const avgProvingTime = getProofsAvgProvingTime(completedProofs)
        if (!avgProvingTime) return <Null />
        return prettyMilliseconds(avgProvingTime)
      }

      return (
        <>
          <span className="align-center flex justify-center whitespace-nowrap">
            {getBestProvingTime()}
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
            avg. {getAverageProvingTime()}
          </span>
        </>
      )
    },
  },
  {
    accessorKey: "proofs",
    header: () => (
      <div className="whitespace-nowrap">
        {Metrics.TOTAL_TTP_LABEL}
        <MetricInfo className="whitespace-normal">
          <ProofStatusInfo />
          <TooltipContentFooter className="space-y-3">
            <Info.Label isSecondary>
              {Metrics.TOTAL_TTP_LABEL} (fastest proof shown)
            </Info.Label>
            <Metrics.TotalTTPDetails />
          </TooltipContentFooter>
        </MetricInfo>
      </div>
    ),
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
