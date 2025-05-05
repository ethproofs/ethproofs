import { Box } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { PopoverTrigger } from "@radix-ui/react-popover"

import type { Metric } from "@/lib/types"

import CopyButton from "@/components/CopyButton"
import DownloadAllButton from "@/components/DownloadAllButton"
import DownloadButton from "@/components/DownloadButton"
import MachineTabs from "@/components/MachineTabs"
import { metrics } from "@/components/Metrics"
import Null from "@/components/Null"
import ProofList from "@/components/ProofList"
import ProofStatus, { ProofStatusInfo } from "@/components/ProofStatus"
import { HidePunctuation } from "@/components/StylePunctuation"
import BookOpen from "@/components/svgs/book-open.svg"
import Clock from "@/components/svgs/clock.svg"
import Cpu from "@/components/svgs/cpu.svg"
import DollarSign from "@/components/svgs/dollar-sign.svg"
import Hash from "@/components/svgs/hash.svg"
import Layers from "@/components/svgs/layers.svg"
import ProofCircle from "@/components/svgs/proof-circle.svg"
import Timer from "@/components/svgs/timer.svg"
import Timestamp from "@/components/Timestamp"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import {
  HeroBody,
  HeroDivider,
  HeroItem,
  HeroItemLabel,
  HeroSection,
  HeroTitle,
} from "@/components/ui/hero"
import * as Info from "@/components/ui/info"
import {
  MetricBox,
  MetricInfo,
  MetricLabel,
  MetricValue,
} from "@/components/ui/metric"
import { Popover, PopoverContent } from "@/components/ui/popover"
import { TooltipContentHeader } from "@/components/ui/tooltip"

import { cn } from "@/lib/utils"

import { AVERAGE_LABEL } from "@/lib/constants"

import { getAvailabilityMetrics, getBlockFeeMetrics } from "./utils"

import { db } from "@/db"
import { fetchBlock } from "@/lib/api/blocks"
import { timestampToEpoch, timestampToSlot } from "@/lib/beaconchain"
import { getBlockValueType, isBlockHash } from "@/lib/blocks"
import { getMetadata } from "@/lib/metadata"
import { formatNumber, formatUsd } from "@/lib/number"
import {
  getCostPerMgasStats,
  getCostPerProofStats,
  getProofsPerStatusCount,
  getProvingCost,
  getProvingTimeStats,
  getTotalTTPStats,
  hasProvedTimestamp,
  isCompleted,
  sortProofsStatusAndTimes,
} from "@/lib/proofs"

type BlockDetailsPageProps = {
  params: Promise<{ block: string }>
}

export async function generateMetadata({
  params,
}: BlockDetailsPageProps): Promise<Metadata> {
  const { block } = await params

  const blockValueType = getBlockValueType(block)
  if (!blockValueType) throw new Error()

  const blockData = await db.query.blocks.findFirst({
    where: (blocks, { eq }) => eq(blocks[blockValueType], block),
    with: {
      proofs: true,
    },
  })

  return getMetadata({
    title: `Block ${blockData ? blockData.block_number : block}`,
  })
}

export default async function BlockDetailsPage({
  params,
}: BlockDetailsPageProps) {
  const blockNumber = (await params).block

  if (isNaN(+blockNumber)) throw new Error()

  const block = await fetchBlock(
    isBlockHash(blockNumber)
      ? {
          hash: blockNumber,
        }
      : {
          blockNumber: +blockNumber,
        }
  )
  if (!block) notFound()

  const { timestamp, block_number, gas_used, proofs, hash } = block

  const proofsPerStatusCount = getProofsPerStatusCount(proofs)

  const singleMachineProofs = proofs.filter(
    (proof) => !proof.cluster_version?.cluster.is_multi_machine
  )

  const multiMachineProofs = proofs.filter(
    (proof) => proof.cluster_version?.cluster.is_multi_machine
  )

  // single machine stats
  const singleMachineStats = {
    costPerProofStats: getCostPerProofStats(singleMachineProofs),
    costPerMgasStats: getCostPerMgasStats(singleMachineProofs, gas_used),
    provingTimeStats: getProvingTimeStats(singleMachineProofs),
    totalTTPStats: getTotalTTPStats(singleMachineProofs, timestamp),
  }

  // multi machine stats
  const multiMachineStats = {
    costPerProofStats: getCostPerProofStats(multiMachineProofs),
    costPerMgasStats: getCostPerMgasStats(multiMachineProofs, gas_used),
    provingTimeStats: getProvingTimeStats(multiMachineProofs),
    totalTTPStats: getTotalTTPStats(multiMachineProofs, timestamp),
  }

  const singleMachineMetrics = getAvailabilityMetrics(singleMachineStats)
  const multiMachineMetrics = getAvailabilityMetrics(multiMachineStats)

  const singleMachineBlockFeeMetrics = getBlockFeeMetrics(singleMachineStats)
  const multiMachineBlockFeeMetrics = getBlockFeeMetrics(multiMachineStats)

  return (
    <div className="-mt-40 space-y-20 px-6 md:px-8">
      <HeroTitle className="mx-auto max-w-[18rem] items-center gap-4">
        <Box strokeWidth="1" className="size-[4.5rem] shrink-0 text-primary" />
        <div className="truncate">
          <h1 className="font-mono">
            <p className="font-sans text-sm font-normal text-body-secondary">
              Block Height
            </p>
            <p className="text-3xl font-semibold tracking-wide">
              <HidePunctuation>{formatNumber(block_number)}</HidePunctuation>
            </p>
          </h1>
          <div className="flex gap-2">
            <div className="truncate font-sans text-sm font-normal text-body-secondary">
              {hash}
            </div>
            <CopyButton message={hash} />
          </div>
        </div>
      </HeroTitle>

      <div className="mx-auto grid w-fit grid-cols-2 gap-x-8 gap-y-4 px-6 md:grid-cols-[auto,auto,auto,auto]">
        <HeroItem className="row-span-2 grid grid-rows-subgrid place-items-center gap-y-1">
          <HeroItemLabel>
            <Clock /> Timestamp
          </HeroItemLabel>
          <Timestamp>{timestamp}</Timestamp>
        </HeroItem>

        <HeroItem className="row-span-2 grid grid-rows-subgrid place-items-center gap-y-1">
          <HeroItemLabel>
            <Cpu /> Gas used
          </HeroItemLabel>
          {gas_used}
        </HeroItem>

        <HeroItem className="row-span-2 grid grid-rows-subgrid place-items-center gap-y-1">
          <HeroItemLabel>
            <Layers /> Slot
          </HeroItemLabel>
          {timestampToSlot(timestamp)}
        </HeroItem>

        <HeroItem className="row-span-2 grid grid-rows-subgrid place-items-center gap-y-1">
          <HeroItemLabel>
            <BookOpen /> Epoch
          </HeroItemLabel>
          {timestampToEpoch(timestamp)}
        </HeroItem>
      </div>

      <div className="flex flex-row gap-8">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>
              <Timer /> Proof availability
            </CardTitle>
          </CardHeader>

          <div className="grid grid-cols-2 gap-x-8 sm:grid-cols-[repeat(5,auto)] sm:grid-rows-[auto,auto] md:flex md:flex-wrap">
            {multiMachineMetrics.map(({ key, label, description, value }) => (
              <MetricBox
                key={key}
                className="row-span-2 grid grid-rows-subgrid"
              >
                <MetricLabel className="flex items-stretch lowercase">
                  <MetricInfo
                    label={<span className="h-full lowercase">{label}</span>}
                  >
                    {description}
                  </MetricInfo>
                </MetricLabel>
                <MetricValue className="font-normal">{value}</MetricValue>
              </MetricBox>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-x-8 sm:grid-cols-[repeat(5,auto)] sm:grid-rows-[auto,auto] md:flex md:flex-wrap">
            {singleMachineMetrics.map(({ key, label, description, value }) => (
              <MetricBox
                key={key}
                className="row-span-2 grid grid-rows-subgrid"
              >
                <MetricLabel className="flex items-stretch lowercase">
                  <MetricInfo
                    label={<span className="h-full lowercase">{label}</span>}
                  >
                    {description}
                  </MetricInfo>
                </MetricLabel>
                <MetricValue className="font-normal">{value}</MetricValue>
              </MetricBox>
            ))}
          </div>
        </Card>

        <Card className="flex-1">
          <CardHeader>
            <CardTitle>
              <DollarSign /> Proof costs
            </CardTitle>
          </CardHeader>

          <div className="grid grid-cols-2 gap-x-8 sm:flex sm:flex-wrap">
            {multiMachineBlockFeeMetrics.map(
              ({ key, label, description, value }) => (
                <MetricBox
                  key={key}
                  className="row-span-2 grid grid-rows-subgrid"
                >
                  <MetricLabel>
                    <MetricInfo
                      label={<span className="lowercase">{label}</span>}
                    >
                      {description}
                    </MetricInfo>
                  </MetricLabel>
                  <MetricValue className="font-normal">{value}</MetricValue>
                </MetricBox>
              )
            )}
          </div>

          <div className="grid grid-cols-2 gap-x-8 sm:flex sm:flex-wrap">
            {singleMachineBlockFeeMetrics.map(
              ({ key, label, description, value }) => (
                <MetricBox
                  key={key}
                  className="row-span-2 grid grid-rows-subgrid"
                >
                  <MetricLabel>
                    <MetricInfo
                      label={<span className="lowercase">{label}</span>}
                    >
                      {description}
                    </MetricInfo>
                  </MetricLabel>
                  <MetricValue className="font-normal">{value}</MetricValue>
                </MetricBox>
              )
            )}
          </div>
        </Card>
      </div>

      <section>
        <div className="flex justify-between md:mb-4">
          <h2 className="flex items-center gap-2 text-lg font-normal text-primary">
            <ProofCircle /> Proofs
          </h2>
          <DownloadAllButton
            blockNumber={blockNumber}
            className="max-md:hidden"
          />
        </div>

        <MachineTabs
          multiContent={<ProofList proofs={multiMachineProofs} block={block} />}
          singleContent={
            <ProofList proofs={singleMachineProofs} block={block} />
          }
        />
      </section>
    </div>
  )
}
