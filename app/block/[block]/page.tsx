import { Box } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { PopoverTrigger } from "@radix-ui/react-popover"

import type { Metric } from "@/lib/types"

import CopyButton from "@/components/CopyButton"
import DownloadAllButton from "@/components/DownloadAllButton"
import DownloadButton from "@/components/DownloadButton"
import { metrics } from "@/components/Metrics"
import Null from "@/components/Null"
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

import { db } from "@/db"
import { timestampToEpoch, timestampToSlot } from "@/lib/beaconchain"
import { getBlockValueType } from "@/lib/blocks"
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
import { prettyMs } from "@/lib/time"

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

  const blockValueType = getBlockValueType(blockNumber)
  if (!blockValueType) throw new Error()

  const block = await db.query.blocks.findFirst({
    with: {
      proofs: {
        with: {
          team: true,
          cluster_version: {
            with: {
              cluster: true,
              cluster_machines: {
                with: {
                  machine: true,
                  cloud_instance: true,
                },
              },
            },
          },
        },
      },
    },
    where: (blocks, { eq }) => eq(blocks[blockValueType], blockNumber),
  })

  if (!block) notFound()

  const { timestamp, block_number, gas_used, proofs, hash } = block

  const proofsPerStatusCount = getProofsPerStatusCount(proofs)

  const costPerProofStats = getCostPerProofStats(proofs)

  const costPerMgasStats = getCostPerMgasStats(proofs, gas_used)

  const provingTimeStats = getProvingTimeStats(proofs)

  const totalTTPStats = getTotalTTPStats(proofs, timestamp)

  const availabilityMetrics: Metric[] = [
    {
      key: "status-of-proofs",
      label: "Status of proofs",
      description: <ProofStatusInfo />,
      value: <ProofStatus statusCount={proofsPerStatusCount} />,
    },
    {
      key: "fastest-proving-time",
      label: (
        <>
          Fastest <metrics.provingTime.Label />
        </>
      ),
      // TODO: Include team information with fastest proving time
      description: (
        <>
          <TooltipContentHeader>
            fastest <metrics.provingTime.Label />
          </TooltipContentHeader>
          <metrics.provingTime.Details />
          <Info.Description>
            Fastest reported proving time for any of the proofs submitted for
            this block
          </Info.Description>
        </>
      ),
      value: provingTimeStats?.bestFormatted ?? <Null />,
    },
    {
      key: "avg-proving-time",
      label: (
        <>
          {AVERAGE_LABEL} <metrics.provingTime.Label />
        </>
      ),
      description: (
        <>
          <TooltipContentHeader>
            average <metrics.provingTime.Label />
          </TooltipContentHeader>
          <metrics.provingTime.Details average />
        </>
      ),
      value: provingTimeStats?.avgFormatted ?? <Null />,
    },
    {
      key: "fastest-total-ttp",
      label: (
        <>
          Fastest <metrics.totalTTP.Label />
        </>
      ),
      // TODO: Include team information with fastest proving time
      description: (
        <>
          <TooltipContentHeader>
            fastest <metrics.totalTTP.Label />
          </TooltipContentHeader>
          <metrics.totalTTP.Details />
          <Info.Description>
            Total time delay between execution block timestamp and completion
            and publishing of proof
          </Info.Description>
          <Info.Description>
            Fastest time to proof for any of the proofs submitted for this block
          </Info.Description>
        </>
      ),
      value: totalTTPStats?.bestFormatted ?? <Null />,
    },
    {
      key: "avg-total-ttp",
      label: (
        <>
          {AVERAGE_LABEL} <metrics.totalTTP.Label />
        </>
      ),
      description: (
        <>
          <TooltipContentHeader>
            average <metrics.totalTTP.Label />
          </TooltipContentHeader>
          <metrics.totalTTP.Details average />
          <Info.Description>
            Total time delay between execution block timestamp and completion
            and publishing of proof
          </Info.Description>
          <Info.Description>
            Average time to proof for all of the proofs submitted for this block
          </Info.Description>
        </>
      ),
      value: totalTTPStats?.avgFormatted ?? <Null />,
    },
  ]

  const blockFeeMetrics: Metric[] = [
    {
      key: "cheapest-cost-per-proof",
      label: (
        <>
          cheapest <metrics.costPerProof.Label />
        </>
      ),
      description: (
        <>
          <TooltipContentHeader>
            cheapest <metrics.costPerProof.Label />
          </TooltipContentHeader>
          <metrics.costPerProof.Details />
        </>
      ),
      value: costPerProofStats?.bestFormatted ?? <Null />,
    },
    {
      key: "avg-cost-per-proof",
      label: (
        <>
          {AVERAGE_LABEL} <metrics.costPerProof.Label />
        </>
      ),
      description: (
        <>
          <TooltipContentHeader>
            {AVERAGE_LABEL} <metrics.costPerProof.Label />
          </TooltipContentHeader>
          <metrics.costPerProof.Details average />
        </>
      ),
      value: costPerProofStats?.avgFormatted ?? <Null />,
    },
    {
      key: "cheapest-cost-per-mgas",
      label: (
        <div>
          cheapest <metrics.costPerMgas.Label />
        </div>
      ),
      description: (
        <>
          <TooltipContentHeader>
            cheapest <metrics.costPerMgas.Label />
          </TooltipContentHeader>
          <metrics.costPerMgas.Details />
        </>
      ),
      value: costPerMgasStats?.bestFormatted ?? <Null />,
    },
    {
      key: "avg-cost-per-mgas",
      label: (
        <div>
          {AVERAGE_LABEL} <metrics.costPerMgas.Label />
        </div>
      ),
      description: (
        <>
          <TooltipContentHeader>
            {AVERAGE_LABEL} <metrics.costPerMgas.Label />
          </TooltipContentHeader>
          <metrics.costPerMgas.Details />
        </>
      ),
      value: costPerMgasStats?.avgFormatted ?? <Null />,
    },
  ]

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

      <div className="space-y-8">
        <section>
          <h2 className="flex items-center gap-2 text-lg font-normal text-primary">
            <Timer /> Proof availability
          </h2>
          <div className="grid grid-cols-2 gap-x-8 sm:grid-cols-[repeat(5,auto)] sm:grid-rows-[auto,auto] md:flex md:flex-wrap">
            {availabilityMetrics.map(({ key, label, description, value }) => (
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
        </section>

        <section>
          <h2 className="flex items-center gap-2 text-lg font-normal text-primary">
            <DollarSign /> Proof costs
          </h2>
          <div className="grid grid-cols-2 gap-x-8 sm:flex sm:flex-wrap">
            {blockFeeMetrics.map(({ key, label, description, value }) => (
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
            ))}
          </div>
        </section>
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

        {proofs.sort(sortProofsStatusAndTimes).map((proof) => {
          const {
            cluster_version,
            proof_id,
            proving_time,
            proved_timestamp,
            proving_cycles,
            team,
          } = proof

          const isAvailable = isCompleted(proof) && hasProvedTimestamp(proof)

          const timeToProof =
            isAvailable && proved_timestamp
              ? Math.max(
                  new Date(proved_timestamp).getTime() -
                    new Date(block.timestamp).getTime(),
                  0
                )
              : 0

          const provingCost = getProvingCost(proof)

          const cluster = cluster_version?.cluster
          const machines = cluster_version?.cluster_machines

          return (
            <div
              className={cn(
                "grid grid-flow-dense grid-cols-4 grid-rows-3",
                "sm:grid-rows-2",
                "md:grid-cols-6-auto md:grid-rows-1"
              )}
              key={proof_id}
            >
              <div
                className={cn(
                  "relative flex h-full items-center",
                  "col-span-3 col-start-1 row-span-1 row-start-1",
                  "sm:col-span-2 sm:col-start-1 sm:row-span-1 sm:row-start-1",
                  "md:col-span-1 md:col-start-1 md:row-span-1 md:row-start-1"
                )}
              >
                {team?.name && (
                  <Link
                    href={"/prover/" + team?.id}
                    className="text-2xl hover:text-primary-light hover:underline"
                  >
                    {team.name}
                  </Link>
                )}
              </div>
              <div
                className={cn(
                  "ms-auto self-center",
                  "col-span-2 col-start-3 row-span-1 row-start-1",
                  "sm:col-span-2 sm:col-start-3 sm:row-span-1 sm:row-start-1",
                  "md:col-span-1 md:col-start-6 md:row-span-1 md:row-start-1"
                )}
              >
                <DownloadButton
                  proof={proof}
                  className="sm:max-md:w-40 lg:w-40"
                  labelClass="hidden sm:inline-block md:hidden lg:inline-block"
                  containerClass="flex-row-reverse md:flex-col-reverse"
                />
              </div>
              <MetricBox
                className={cn(
                  "col-span-2 col-start-1 row-span-1 row-start-2",
                  "sm:col-span-1 sm:col-start-1 sm:row-span-1 sm:row-start-2",
                  "md:col-span-1 md:col-start-2 md:row-span-1 md:row-start-1"
                )}
              >
                <MetricLabel>
                  <MetricInfo label={<metrics.totalTTP.Label />}>
                    <TooltipContentHeader>
                      <metrics.totalTTP.Label />
                    </TooltipContentHeader>
                    <metrics.totalTTP.Details />
                  </MetricInfo>
                </MetricLabel>
                <MetricValue className="font-normal">
                  {isAvailable && timeToProof > 0 ? (
                    prettyMs(timeToProof)
                  ) : (
                    <Null />
                  )}
                </MetricValue>
              </MetricBox>
              <MetricBox
                className={cn(
                  "col-span-2 col-start-3 row-span-1 row-start-2",
                  "sm:col-span-1 sm:col-start-2 sm:row-span-1 sm:row-start-2",
                  "md:col-span-1 md:col-start-3 md:row-span-1 md:row-start-1"
                )}
              >
                <MetricLabel>
                  <MetricInfo label={<metrics.provingTime.Label />}>
                    <TooltipContentHeader>
                      <metrics.provingTime.Label />
                    </TooltipContentHeader>
                    <metrics.provingTime.Details />
                  </MetricInfo>
                </MetricLabel>
                <MetricValue className="font-normal">
                  {isAvailable && proving_time ? (
                    prettyMs(proving_time)
                  ) : (
                    <Null />
                  )}
                </MetricValue>
              </MetricBox>
              <MetricBox
                className={cn(
                  "col-span-2 col-start-1 row-span-1 row-start-3",
                  "sm:col-span-1 sm:col-start-3 sm:row-span-1 sm:row-start-2",
                  "md:col-span-1 md:col-start-4 md:row-span-1 md:row-start-1"
                )}
              >
                <MetricLabel>
                  <MetricInfo
                    label={
                      <div>
                        <span className="normal-case">{team?.name}</span> zk
                        <span className="uppercase">VM</span> cycles
                      </div>
                    }
                  >
                    <TooltipContentHeader>
                      <span className="normal-case">{team?.name}</span> zk
                      <span className="uppercase">VM</span> cycles
                    </TooltipContentHeader>
                    <Info.Derivation>
                      <Info.Term type="internal">proving cycles</Info.Term>
                    </Info.Derivation>
                    <p>
                      <Info.Term type="internal">proving cycles</Info.Term> is
                      self-reported by{" "}
                      {team?.name ? team.name : "the proving team"}
                    </p>
                    <Info.Description>
                      The number of cycles used by{" "}
                      {team?.name ? team.name : "the proving team"} to generate
                      the proof.
                    </Info.Description>
                    <Info.Description>
                      This number will vary depending on hardware and zkVMs
                      being used by different provers and should not be directly
                      compared to other provers.
                    </Info.Description>
                  </MetricInfo>
                </MetricLabel>
                <MetricValue
                  className="font-normal"
                  title={proving_cycles ? formatNumber(proving_cycles) : ""}
                >
                  {isAvailable && proving_cycles ? (
                    formatNumber(proving_cycles, {
                      notation: "compact",
                      compactDisplay: "short",
                      maximumSignificantDigits: 4,
                    })
                  ) : (
                    <Null />
                  )}
                </MetricValue>
              </MetricBox>
              <MetricBox
                className={cn(
                  "col-span-2 col-start-3 row-span-1 row-start-3",
                  "sm:col-span-1 sm:col-start-4 sm:row-span-1 sm:row-start-2",
                  "md:col-span-1 md:col-start-5 md:row-span-1 md:row-start-1",
                  "sm:max-md:text-end"
                )}
              >
                <MetricLabel className="sm:max-md:justify-end">
                  <MetricInfo label={<metrics.costPerProof.Label />}>
                    <TooltipContentHeader>
                      <metrics.costPerProof.Label />
                    </TooltipContentHeader>
                    <metrics.costPerProof.Details />
                  </MetricInfo>
                </MetricLabel>
                <MetricValue className="font-normal">
                  {isAvailable && provingCost ? (
                    <Popover>
                      <PopoverTrigger className="flex items-center gap-2">
                        {formatUsd(provingCost)} <Cpu />
                      </PopoverTrigger>
                      {cluster && machines && (
                        <PopoverContent>
                          <TooltipContentHeader>
                            {cluster.nickname}
                          </TooltipContentHeader>

                          <div className="space-y-2">
                            {cluster.hardware && (
                              <p>Hardware: {cluster.hardware}</p>
                            )}
                            {cluster.cycle_type && (
                              <p>Cycle type: {cluster.cycle_type}</p>
                            )}
                            {cluster.description && (
                              <p>{cluster.description}</p>
                            )}
                          </div>

                          <hr className="my-4 bg-body-secondary" />

                          <TooltipContentHeader>
                            AWS Equivalency
                          </TooltipContentHeader>

                          <div className="w-fit space-y-4">
                            {machines.map(
                              ({
                                cloud_instance_count,
                                cloud_instance_id,
                                cloud_instance,
                              }) => {
                                const {
                                  memory,
                                  disk_name,
                                  disk_space,
                                  instance_name,
                                  region,
                                  cpu_cores,
                                  hourly_price,
                                } = cloud_instance || {}
                                const total_price = hourly_price
                                  ? hourly_price * cloud_instance_count
                                  : 0
                                return (
                                  <div
                                    className="flex flex-col divide-y-2 overflow-hidden rounded bg-background"
                                    key={cloud_instance_id}
                                  >
                                    <div className="flex gap-8">
                                      <div className="flex-1 space-y-2 p-2">
                                        {memory && <p>Memory: {memory} GB</p>}
                                        {disk_name && (
                                          <p>
                                            Storage: {disk_name} {disk_space} GB
                                          </p>
                                        )}
                                        {instance_name && (
                                          <p>Type: {instance_name}</p>
                                        )}
                                        {region && <p>Region: {region}</p>}
                                        {cpu_cores && <p>vCPU: {cpu_cores}</p>}
                                      </div>
                                      {cloud_instance_count && (
                                        <div className="grid h-fit place-items-center rounded-bl bg-primary-dark px-4 py-2 text-xl font-bold text-background-highlight">
                                          x{cloud_instance_count}
                                        </div>
                                      )}
                                    </div>
                                    {hourly_price && (
                                      <div className="p-2">
                                        Hourly price per instance:{" "}
                                        {formatUsd(hourly_price)}
                                      </div>
                                    )}
                                    {total_price && (
                                      <div className="p-2">
                                        <strong>Total hourly price</strong>:{" "}
                                        {formatUsd(total_price)}
                                      </div>
                                    )}
                                  </div>
                                )
                              }
                            )}{" "}
                          </div>
                        </PopoverContent>
                      )}
                    </Popover>
                  ) : (
                    <Null />
                  )}
                </MetricValue>
              </MetricBox>
            </div>
          )
        })}
      </section>
    </div>
  )
}
