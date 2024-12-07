import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import prettyMilliseconds from "pretty-ms"

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

import { SITE_NAME } from "@/lib/constants"

import { timestampToEpoch, timestampToSlot } from "@/lib/beaconchain"
import { getBlockValueType } from "@/lib/blocks"
import { getMetadata } from "@/lib/metadata"
import { formatNumber } from "@/lib/number"
import {
  getAvgProvingCost,
  getProofBestProvingCost,
  getProofBestProvingTime,
  getProofBestTimeToProof,
  getProofsAvgProvingTime,
  getProofsAvgTimeToProof,
  sortProofsStatusAndTimes,
} from "@/lib/proofs"
import { createClient } from "@/utils/supabase/client"

const supabase = createClient()

type BlockDetailsPageProps = {
  params: Promise<{ block: number }>
}

export async function generateMetadata({
  params,
}: BlockDetailsPageProps): Promise<Metadata> {
  const { block } = await params

  const { data, error } = await supabase
    .from("blocks")
    .select("*, proofs(*)")
    .eq(getBlockValueType(block), block)
    .single()

  return getMetadata({
    title: `Block ${error ? block : data.block_number}`,
  })
}

export default async function BlockDetailsPage({
  params,
}: BlockDetailsPageProps) {
  const blockNumber = (await params).block

  const { data: block, error } = await supabase
    .from("blocks")
    .select("*, proofs(*)")
    .eq(getBlockValueType(blockNumber), blockNumber)
    .single()

  const { data: teams } = await supabase.from("teams").select("*")

  if (!block || error || !teams) notFound()

  const { timestamp, block_number, gas_used, proofs, hash } = block

  const proofsWithTeams = proofs.map((proof) => {
    const team = teams.find((t) => t.user_id === proof.user_id)
    return { ...proof, team }
  })

  // TODO: Add proper descriptions

  const bestProvingTimeProof = getProofBestProvingTime(proofs)
  const avgProvingTime = getProofsAvgProvingTime(proofs)
  const bestTimeToProofProof = getProofBestTimeToProof(proofs)
  const bestTimeToProof = bestTimeToProofProof?.proved_timestamp
    ? new Date(bestTimeToProofProof?.proved_timestamp).getTime() -
      new Date(block.timestamp).getTime()
    : 0
  const avgTimeToProof = getProofsAvgTimeToProof(block)

  const availabilityMetrics: Metric[] = [
    {
      label: "Status of proofs",
      description: <ProofStatusInfo />,
      value: <ProofStatus proofs={proofs} />,
    },
    {
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
      value: bestProvingTimeProof?.proving_time ? (
        prettyMilliseconds(bestProvingTimeProof.proving_time)
      ) : (
        <Null />
      ),
    },
    {
      label: (
        <>
          avg <metrics.provingTime.Label />
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
      value: avgProvingTime ? prettyMilliseconds(avgProvingTime) : <Null />,
    },
    {
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
      value:
        bestTimeToProof > 0 ? prettyMilliseconds(bestTimeToProof) : <Null />,
    },
    {
      label: (
        <>
          Avg <metrics.totalTTP.Label />
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
      value: avgTimeToProof ? prettyMilliseconds(avgTimeToProof) : <Null />,
    },
  ]

  const cheapestProof = getProofBestProvingCost(proofs)
  const avgCostPerProof = getAvgProvingCost(proofs)
  const megaGas = block.gas_used / 1e6

  const blockFeeMetrics: Metric[] = [
    {
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
      value: cheapestProof?.proving_cost ? (
        formatNumber(cheapestProof.proving_cost, {
          style: "currency",
          currency: "USD",
        })
      ) : (
        <Null />
      ),
    },
    {
      label: (
        <>
          avg <metrics.costPerProof.Label />
        </>
      ),
      description: (
        <>
          <TooltipContentHeader>avg cost per proof</TooltipContentHeader>
          <metrics.costPerProof.Details average />
        </>
      ),
      value: avgCostPerProof ? (
        formatNumber(avgCostPerProof, {
          style: "currency",
          currency: "USD",
        })
      ) : (
        <Null />
      ),
    },
    {
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
      value:
        cheapestProof?.proving_cost && block.gas_used ? (
          formatNumber(cheapestProof.proving_cost / megaGas, {
            style: "currency",
            currency: "USD",
          })
        ) : (
          <Null />
        ),
    },
    {
      label: (
        <>
          avg <metrics.costPerMgas.Label />
        </>
      ),
      description: (
        <>
          <TooltipContentHeader>
            avg <metrics.costPerMgas.Label />
          </TooltipContentHeader>
          <metrics.costPerMgas.Details />
        </>
      ),
      value:
        avgCostPerProof && block.gas_used ? (
          formatNumber(avgCostPerProof / megaGas, {
            style: "currency",
            currency: "USD",
          })
        ) : (
          <Null />
        ),
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
            {availabilityMetrics.map(({ label, description, value }, idx) => (
              <MetricBox key={idx}>
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
            {blockFeeMetrics.map(({ label, description, value }, idx) => (
              <MetricBox key={idx}>
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
            proof_status,
            proved_timestamp,
            proving_cost,
            proving_cycles,
            team,
          } = proof
          const isComplete = proof_status === "proved" && !!proved_timestamp
          const timeToProof = proved_timestamp
            ? Math.max(
                new Date(proved_timestamp).getTime() -
                  new Date(block.timestamp).getTime(),
                0
              )
            : 0
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
                  {isComplete && timeToProof > 0 ? (
                    prettyMilliseconds(timeToProof)
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
                  {isComplete && proving_time ? (
                    prettyMilliseconds(proving_time)
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
                  {isComplete && proving_cycles ? (
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
                  {isComplete && proving_cost ? (
                    formatNumber(proving_cost, {
                      style: "currency",
                      currency: "USD",
                    })
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
