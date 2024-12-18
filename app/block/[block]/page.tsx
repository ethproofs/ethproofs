import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import type { Metric } from "@/lib/types"

import CopyButton from "@/components/CopyButton"
import DownloadButton from "@/components/DownloadButton"
import { metrics } from "@/components/Metrics"
import Null from "@/components/Null"
import ProofStatus, { ProofStatusInfo } from "@/components/ProofStatus"
import { HidePunctuation } from "@/components/StylePunctuation"
import BookOpen from "@/components/svgs/book-open.svg"
import Box from "@/components/svgs/box.svg"
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
  getProvingCost,
  getProvingTimeStats,
  getTotalTTPStats,
  hasProvedTimestamp,
  isCompleted,
  sortProofsStatusAndTimes,
} from "@/lib/proofs"
import { prettyMs } from "@/lib/time"

type BlockDetailsPageProps = {
  params: Promise<{ block: number }>
}

export async function generateMetadata({
  params,
}: BlockDetailsPageProps): Promise<Metadata> {
  const { block } = await params

  const blockValueType = getBlockValueType(block)
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

  const block = await db.query.blocks.findFirst({
    with: {
      proofs: {
        with: {
          cluster: {
            with: {
              cluster_configuration: {
                with: {
                  aws_instance_pricing: true,
                },
              },
            },
          },
        },
      },
    },
    where: (blocks, { eq }) => eq(blocks[blockValueType], blockNumber),
  })

  const teams = await db.query.teams.findMany()

  if (!block || !teams) notFound()

  const { timestamp, block_number, gas_used, proofs, hash } = block

  const proofsWithTeams = proofs.map((proof) => {
    const team = teams.find((t) => t.user_id === proof.user_id)
    return { ...proof, team }
  })

  const costPerProofStats = getCostPerProofStats(proofs)

  const costPerMgasStats = getCostPerMgasStats(proofs, gas_used)

  const provingTimeStats = getProvingTimeStats(proofs)

  const totalTTPStats = getTotalTTPStats(proofs, timestamp)

  const availabilityMetrics: Metric[] = [
    {
      key: "status-of-proofs",
      label: "Status of proofs",
      description: <ProofStatusInfo />,
      value: <ProofStatus proofs={proofs} />,
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
        <>
          cheapest <metrics.costPerMgas.Label />
        </>
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
        <>
          {AVERAGE_LABEL} <metrics.costPerMgas.Label />
        </>
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
    <div className="space-y-20">
      <HeroSection>
        <HeroTitle>
          <Box strokeWidth="1" className="shrink-0 text-6xl text-primary" />
          <h1 className="font-mono">
            <p className="text-sm font-normal md:text-lg">Block Height</p>
            <p className="text-3xl font-semibold tracking-wide">
              <HidePunctuation>{formatNumber(block_number)}</HidePunctuation>
            </p>
          </h1>
        </HeroTitle>

        <HeroDivider />

        <HeroBody>
          <HeroItem>
            <HeroItemLabel>
              <Clock /> Timestamp
            </HeroItemLabel>
            <Timestamp>{timestamp}</Timestamp>
          </HeroItem>

          <div className="grid grid-cols-3 gap-6">
            <HeroItem>
              <HeroItemLabel>
                <Cpu /> Gas used
              </HeroItemLabel>
              <HidePunctuation>{formatNumber(gas_used)}</HidePunctuation>
            </HeroItem>

            <HeroItem>
              <HeroItemLabel>
                <Layers /> Slot
              </HeroItemLabel>
              <HidePunctuation>
                {formatNumber(timestampToSlot(timestamp))}
              </HidePunctuation>
            </HeroItem>

            <HeroItem>
              <HeroItemLabel>
                <BookOpen /> Epoch
              </HeroItemLabel>
              <HidePunctuation>
                {formatNumber(timestampToEpoch(timestamp))}
              </HidePunctuation>
            </HeroItem>
          </div>

          <HeroItem>
            <HeroItemLabel>
              <Hash /> Hash
            </HeroItemLabel>
            <div className="flex gap-2">
              <div className="truncate">{hash}</div>
              <CopyButton message={hash} />
            </div>
          </HeroItem>
        </HeroBody>
      </HeroSection>

      <div className="space-y-8">
        <section>
          <h2 className="flex items-center gap-2 text-lg font-normal text-primary">
            <Timer /> Proof availability
          </h2>
          <div className="grid grid-cols-2 gap-x-8 sm:flex sm:flex-wrap">
            {availabilityMetrics.map(({ key, label, description, value }) => (
              <MetricBox key={key}>
                <MetricLabel className="lowercase">
                  {label}
                  <MetricInfo>{description}</MetricInfo>
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
              <MetricBox key={key}>
                <MetricLabel>
                  {label}
                  <MetricInfo>{description}</MetricInfo>
                </MetricLabel>
                <MetricValue className="font-normal">{value}</MetricValue>
              </MetricBox>
            ))}
          </div>
        </section>
      </div>

      <section>
        <h2 className="flex items-center gap-2 text-lg font-normal text-primary">
          <ProofCircle /> Proofs
        </h2>

        {proofsWithTeams.sort(sortProofsStatusAndTimes).map((proof) => {
          const {
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
                {team?.team_name && (
                  <Link
                    href={"/prover/" + team?.team_id}
                    className="text-2xl hover:text-primary-light hover:underline"
                  >
                    {team.team_name}
                  </Link>
                )}
              </div>
              <div
                className={cn(
                  "ms-auto self-center",
                  "col-span-1 col-start-4 row-span-1 row-start-1",
                  "sm:col-span-2 sm:col-start-3 sm:row-span-1 sm:row-start-1",
                  "md:col-span-1 md:col-start-6 md:row-span-1 md:row-start-1"
                )}
              >
                <DownloadButton proof={proof} />
              </div>{" "}
              <MetricBox
                className={cn(
                  "col-span-2 col-start-1 row-span-1 row-start-2",
                  "sm:col-span-1 sm:col-start-1 sm:row-span-1 sm:row-start-2",
                  "md:col-span-1 md:col-start-2 md:row-span-1 md:row-start-1"
                )}
              >
                <MetricLabel>
                  <metrics.totalTTP.Label />
                  <MetricInfo>
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
                  <metrics.provingTime.Label />
                  <MetricInfo>
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
                  <span className="normal-case">{team?.team_name}</span> zk
                  <span className="uppercase">VM</span> cycles
                  <MetricInfo>
                    <TooltipContentHeader>
                      <span className="normal-case">{team?.team_name}</span> zk
                      <span className="uppercase">VM</span> cycles
                    </TooltipContentHeader>
                    <Info.Derivation>
                      <Info.Term type="internal">proving cycles</Info.Term>
                    </Info.Derivation>
                    <p>
                      <Info.Term type="internal">proving cycles</Info.Term> is
                      self-reported by{" "}
                      {team?.team_name ? team.team_name : "the proving team"}
                    </p>
                    <Info.Description>
                      The number of cycles used by{" "}
                      {team?.team_name ? team.team_name : "the proving team"} to
                      generate the proof.
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
                  <metrics.costPerProof.Label />
                  <MetricInfo>
                    <TooltipContentHeader>
                      <metrics.costPerProof.Label />
                    </TooltipContentHeader>
                    <metrics.costPerProof.Details />
                  </MetricInfo>
                </MetricLabel>
                <MetricValue className="font-normal">
                  {isAvailable && provingCost ? (
                    formatUsd(provingCost)
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
