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

import { BLOCK_GAS_LIMIT } from "@/lib/constants"

import { MetricInfo } from "../ui/metric"
import { Progress } from "../ui/progress"
import { TooltipContentFooter, TooltipContentHeader } from "../ui/tooltip"

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
    header: () => (
      <div className="text-left">
        block
        <MetricInfo>
          <TooltipContentHeader>Block height number</TooltipContentHeader>
          <p>
            <span className="font-mono text-primary">block_number</span> value
            from execution block
          </p>
          <TooltipContentFooter>
            <p>Time since block published</p>
            <p>
              <span className="font-mono text-primary-light">now</span> -{" "}
              <span className="font-mono text-primary-light">timestamp</span>
            </p>
            <p>
              <span className="font-mono text-primary-light">timestamp</span>{" "}
              value from execution block
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
          <p>
            <span className="font-mono text-primary">gas_used</span> /{" "}
            <span className="font-mono">
              10
              <sup>6</sup>
            </span>
          </p>
          <p>
            <span className="font-mono text-primary">gas_used</span> value from
            execution block, expressed in millions
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

      const percentGasUsage = (gasUsed / BLOCK_GAS_LIMIT) * 100
      return (
        <>
          {formatted}
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
    header: () => (
      <div className="whitespace-nowrap">
        cost per proof
        <MetricInfo className="whitespace-normal">
          <TooltipContentHeader>
            Proving costs in USD for entire proof of block
          </TooltipContentHeader>
          <p>
            <span className="italic">proving costs</span> - USD costs,
            self-reported by proving teams
          </p>
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
                <Award className="text-primary hover:text-primary-light" />
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
          <p>
            <span className="italic">proving costs</span> /{" "}
            <span className="font-mono text-primary">gas_used</span> / 10
            <sup>6</sup>
          </p>

          <p className="">
            <span className="italic">proving costs</span> - USD costs,
            self-reported by proving teams
          </p>
          <p className="">
            <span className="font-mono text-primary">gas_used</span> - value
            from execution block, expressed in millions
          </p>
          <p className="text-body-secondary">
            Normalized USD cost per gas unit to allow comparison amongst proofs
            of different sized blocks. More gas consumption in a block means
            more computation to prove.
          </p>
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
                <Award className="text-primary hover:text-primary-light" />
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
        proving time
        <MetricInfo className="whitespace-normal">
          <TooltipContentHeader>
            Time spent generating proof of execution
          </TooltipContentHeader>
          <p>
            <span className="italic">proof latency</span> - duration of proof
            generation process, self reported by proving teams
          </p>
          <p className="text-body-secondary">
            Duration of time reported by the proving team to generate the proof
            for this block.
          </p>
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

      const getBestLatency = () => {
        if (!completedProofs.length) return <Null />

        return prettyMilliseconds(fastestProof.proof_latency!)
      }

      const getAverageLatency = () => {
        if (!completedProofs.length) return <Null />

        return prettyMilliseconds(getProofsAvgLatency(completedProofs) * 1e3)
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
              <Link href="#" className="text-primary underline">
                Team {reduceFastest(completedProofs).user_id}
              </Link>
              <span className="block">
                Machine {reduceFastest(completedProofs).machine_id}
              </span>
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
    header: () => (
      <div className="whitespace-nowrap">
        proof status
        <MetricInfo className="whitespace-normal">
          <TooltipContentHeader>
            Current status of proofs for this block
          </TooltipContentHeader>
          <div className="items-top grid grid-cols-[auto,1fr] gap-4">
            <Box className="self-center text-2xl text-primary" />
            Number of completed proofs that have been published for this block.
            <BoxDashed className="self-center text-2xl text-primary" />
            Number of provers currently generating proofs for this block.
            <Box className="self-center text-2xl text-body-secondary" />
            Number of provers who have indicated intent to prove this block.
          </div>
          <TooltipContentFooter>
            <p className="font-bold">Time to proof (fastest proof shown)</p>
            <div className="my-2">
              <span className="italic">proof submission time</span> -{" "}
              <span className="font-mono text-body">timestamp</span>
            </div>
            <p>
              <span className="italic">proof submission time</span> - timestamp
              logged by EthProofs when completed proof submitted
            </p>
            <p>
              <span className="font-mono text-primary-light">timestamp</span>{" "}
              value from execution block
            </p>
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
          <div className="mx-auto flex items-center gap-3 font-mono">
            <div className="flex items-center gap-1">
              <MetricInfo trigger={<Box className="text-primary" />}>
                <span className="!font-body text-body">
                  Number of completed proofs that have been published for this
                </span>
                block.
              </MetricInfo>

              <span className="block">{completedProofs.length}</span>
            </div>
            <div className="flex items-center gap-1">
              <MetricInfo trigger={<BoxDashed className="text-primary" />}>
                <span className="!font-body text-body">
                  Number of provers currently generating proofs for this block.
                </span>
              </MetricInfo>
              <span className="block">
                {proofs.filter((p) => p.proof_status === "proving").length}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <MetricInfo trigger={<Box className="text-body-secondary" />}>
                <span className="!font-body text-body">
                  Number of provers who have indicated intent to prove this
                  block.
                </span>
              </MetricInfo>
              <span className="block">
                {proofs.filter((p) => p.proof_status === "queued").length}
              </span>
            </div>
          </div>
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
