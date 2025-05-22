import { Box } from "lucide-react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

import CopyButton from "@/components/CopyButton"
import DownloadAllButton from "@/components/DownloadAllButton"
import MachineTabs from "@/components/MachineTabs"
import ProofList from "@/components/ProofList"
import ProofStatus, { ProofStatusInfo } from "@/components/ProofStatus"
import { HidePunctuation } from "@/components/StylePunctuation"
import BookOpen from "@/components/svgs/book-open.svg"
import Clock from "@/components/svgs/clock.svg"
import Cpu from "@/components/svgs/cpu.svg"
import DollarSign from "@/components/svgs/dollar-sign.svg"
import Layers from "@/components/svgs/layers.svg"
import ProofCircle from "@/components/svgs/proof-circle.svg"
import Timer from "@/components/svgs/timer.svg"
import Timestamp from "@/components/Timestamp"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { HeroItem, HeroItemLabel, HeroTitle } from "@/components/ui/hero"
import {
  MetricBox,
  MetricInfo,
  MetricLabel,
  MetricValue,
} from "@/components/ui/metric"

import {
  getAvailabilityMetrics,
  getBlockFeeMetrics,
} from "@/app/block/[block]/utils"
import { fetchBlock } from "@/lib/api/blocks"
import { timestampToEpoch, timestampToSlot } from "@/lib/beaconchain"
import { isBlockHash } from "@/lib/blocks"
import { getMetadata } from "@/lib/metadata"
import { formatNumber } from "@/lib/number"
import {
  getCostPerMgasStats,
  getCostPerProofStats,
  getProofsPerStatusCount,
  getProvingTimeStats,
  getTotalTTPStats,
} from "@/lib/proofs"

export type BlockDetailsPageProps = {
  params: Promise<{ block: string }>
}

export async function generateMetadata({
  params,
}: BlockDetailsPageProps): Promise<Metadata> {
  const { block } = await params

  if (isNaN(+block)) throw new Error()

  const blockData = await fetchBlock(
    isBlockHash(block)
      ? {
          hash: block,
        }
      : {
          blockNumber: +block,
        }
  )

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
    <div className="mx-auto max-w-screen-xl space-y-20 px-6 md:px-8 [&>section]:w-full">
      <HeroTitle className="mx-auto mb-24 mt-16 w-fit items-center gap-4 md:mt-24">
        <Box strokeWidth="1" className="size-[4.5rem] shrink-0 text-primary" />
        <div className="max-w-[14rem]">
          <h1 className="font-mono">
            <p className="font-sans text-sm font-normal text-body-secondary">
              Block Height
            </p>
            <p className="text-3xl font-semibold tracking-wide">
              <HidePunctuation>{formatNumber(block_number)}</HidePunctuation>
            </p>
          </h1>
          <div className="flex gap-2 truncate">
            <div className="truncate font-sans text-sm font-normal text-body-secondary">
              {hash}
            </div>
            <CopyButton message={hash} />
          </div>
        </div>
      </HeroTitle>

      <section className="grid w-fit grid-cols-2 gap-x-8 gap-y-4 px-6 md:grid-cols-[auto,auto,auto,auto]">
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
      </section>

      <section className="flex flex-col gap-8 xl:flex-row">
        <Card className="flex-1">
          <CardHeader className="flex h-16 flex-row justify-between space-y-0">
            <CardTitle className="flex items-center gap-2 font-mono text-lg font-normal [&>svg]:shrink-0">
              <Timer /> Proof availability
            </CardTitle>

            <MetricBox className="py-0">
              <MetricLabel>
                <MetricInfo label="Status of proofs">
                  <ProofStatusInfo title="Status of proofs" />
                </MetricInfo>
              </MetricLabel>
              <MetricValue className="font-normal">
                <ProofStatus statusCount={proofsPerStatusCount} />
              </MetricValue>
            </MetricBox>
          </CardHeader>

          <div>
            <div className="text-center font-mono text-sm text-primary sm:text-start">
              multi-machine performance
            </div>
            <div className="grid grid-cols-1 place-items-center gap-x-8 text-center sm:grid-cols-2 sm:place-items-start sm:text-start lg:grid-cols-4 xl:grid-cols-2">
              {multiMachineMetrics.map(({ key, label, description, value }) => (
                <MetricBox
                  key={"multi-" + key}
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
          </div>

          <div>
            <div className="text-center font-mono text-sm text-primary sm:text-start">
              single machine performance
            </div>
            <div className="grid grid-cols-1 place-items-center gap-x-8 text-center sm:grid-cols-2 sm:place-items-start sm:text-start lg:grid-cols-4 xl:grid-cols-2">
              {singleMachineMetrics.map(
                ({ key, label, description, value }) => (
                  <MetricBox
                    key={"single-" + key}
                    className="row-span-2 grid grid-rows-subgrid"
                  >
                    <MetricLabel className="flex items-stretch lowercase">
                      <MetricInfo
                        label={
                          <span className="h-full lowercase">{label}</span>
                        }
                      >
                        {description}
                      </MetricInfo>
                    </MetricLabel>
                    <MetricValue className="font-normal">{value}</MetricValue>
                  </MetricBox>
                )
              )}
            </div>
          </div>
        </Card>

        <Card className="flex-1">
          <CardHeader className="flex h-16 flex-row items-center">
            <CardTitle className="flex items-center gap-2 font-mono text-lg font-normal [&>svg]:shrink-0">
              <DollarSign /> Proof costs
            </CardTitle>
          </CardHeader>

          <div>
            <div className="text-center font-mono text-sm text-primary sm:text-start">
              multi-machine performance
            </div>
            <div className="grid grid-cols-1 place-items-center gap-x-8 text-center sm:grid-cols-2 sm:place-items-start sm:text-start lg:grid-cols-4 xl:grid-cols-2">
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
          </div>

          <div>
            <div className="text-center font-mono text-sm text-primary sm:text-start">
              single machine performance
            </div>
            <div className="grid grid-cols-1 place-items-center gap-x-8 text-center sm:grid-cols-2 sm:place-items-start sm:text-start lg:grid-cols-4 xl:grid-cols-2">
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
          </div>
        </Card>
      </section>

      <section>
        <div className="flex justify-between md:mb-4">
          <h2 className="flex items-center gap-2 text-lg font-normal text-primary">
            <ProofCircle /> Proofs
          </h2>
          {proofs.length >= 1 && (
            <DownloadAllButton
              blockNumber={blockNumber}
              className="max-md:hidden"
            />
          )}
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
