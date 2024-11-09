/* eslint-disable simple-import-sort/imports */
import type { Metadata } from "next"
import Image, { type ImageProps } from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

import LearnMore from "@/components/LearnMore"
import ArrowDown from "@/components/svgs/arrow-down.svg"
import BlockLarge from "@/components/svgs/block-large.svg"
import BookOpen from "@/components/svgs/book-open.svg"
import Clock from "@/components/svgs/clock.svg"
import Cpu from "@/components/svgs/cpu.svg"
import DollarSign from "@/components/svgs/dollar-sign.svg"
import Hash from "@/components/svgs/hash.svg"
import Layers from "@/components/svgs/layers.svg"
import ProofCircle from "@/components/svgs/proof-circle.svg"
import TrendingUp from "@/components/svgs/trending-up.svg"
import { Button } from "@/components/ui/button"
import {
  HeroBody,
  HeroDivider,
  HeroItem,
  HeroItemLabel,
  HeroSection,
  HeroTitle,
} from "@/components/ui/hero"
import {
  MetricBox,
  MetricInfo,
  MetricLabel,
  MetricValue,
} from "@/components/ui/metric"

import CopyButton from "@/components/CopyButton"
import { timestampToEpoch, timestampToSlot } from "@/lib/beaconchain"
import { intervalToSeconds, renderTimestamp } from "@/lib/date"
import { getMetadata } from "@/lib/metadata"
import { formatNumber } from "@/lib/number"
import {
  getAvgCostPerMegaCycle,
  getAvgCostPerMegaGas,
  getAvgCostPerTx,
  getProofsAvgCost,
  getProofsAvgLatency,
} from "@/lib/proofs"
import type { Metric } from "@/lib/types"
import { cn } from "@/lib/utils"
import { createClient } from "@/utils/supabase/client"
import { Tables } from "@/lib/database.types"

type BlockDetailsPageProps = {
  params: Promise<{ block: number }>
}

export async function generateMetadata({
  params,
}: BlockDetailsPageProps): Promise<Metadata> {
  const { block } = await params
  return getMetadata({ title: `Block ${block}` }) // TODO: Confirm number formatting
}

export default async function BlockDetailsPage({
  params,
}: BlockDetailsPageProps) {
  const { block } = await params

  const supabase = createClient()

  const { data, error } = await supabase
    .from("blocks")
    .select("*, proofs(*)")
    .eq("block_number", block)
    .single()

  const { data: teams } = await supabase.from("teams").select("*")

  if (!data || error || !teams) notFound()

  const getProverLogoImgProps = (
    team: Tables<"teams"> | undefined
  ): Pick<ImageProps, "src" | "alt"> | null => {
    if (!team?.logo_url) return null
    return {
      src: team.logo_url,
      alt: `${team.team_name} logo`,
    }
  }

  const { timestamp, gas_used, total_fees, transaction_count, proofs, hash } =
    data

  // TODO: Dummy data, get block size data
  const size = 32735

  // TODO: Add proper descriptions
  const performanceItems: Metric[] = [
    {
      label: "Total proofs",
      description: "The total number of proofs generated by this prover.",
      value: formatNumber(proofs.length),
    },
    {
      label: "Avg latency",
      description: "The average time it takes to generate a proof.",
      value: formatNumber(getProofsAvgLatency(proofs), {
        style: "unit",
        unit: "second",
        unitDisplay: "narrow",
        maximumFractionDigits: 0,
      }),
    },
    {
      label: "Gas used",
      description: "The total gas used to generate all proofs.",
      value: formatNumber(gas_used),
    },
    {
      label: "Transaction count",
      description: "The total number of transactions in this block.",
      value: formatNumber(transaction_count),
    },
  ]

  const avgCostPerProof = getProofsAvgCost(proofs)

  const blockFeeMetrics: Metric[] = [
    {
      label: "total fees (gwei)",
      description: "The total fees collected in this block.",
      value: formatNumber(total_fees),
    },
    {
      label: "avg cost / proof",
      description: "The average cost of generating a proof.",
      value: formatNumber(avgCostPerProof, {
        style: "currency",
        currency: "USD",
      }),
    },
    {
      label: "cost / mega gas",
      description: "The cost of generating a proof per million gas.",
      value: formatNumber(getAvgCostPerMegaGas(avgCostPerProof, gas_used), {
        style: "currency",
        currency: "USD",
      }),
    },
    {
      label: "cost / mega cycle",
      description: "The cost of generating a proof per million cycles.",
      value: formatNumber(getAvgCostPerMegaCycle(proofs), {
        style: "currency",
        currency: "USD",
      }),
    },
    {
      label: "cost / transaction",
      description: "The cost of generating a proof per transaction.",
      value: formatNumber(getAvgCostPerTx(avgCostPerProof, transaction_count), {
        style: "currency",
        currency: "USD",
      }),
    },
  ]

  return (
    <div className="space-y-20">
      <HeroSection>
        <HeroTitle>
          <BlockLarge className="text-6xl text-primary" />
          <h1 className="font-mono">
            <p className="text-sm font-normal md:text-lg">Block Height</p>
            <p className="text-3xl font-semibold">
              {/* {formatNumber(block)} */}
              {/* TODO: Confirm number formatting for block height, slot, epoch, etc */}
              {block}
            </p>
          </h1>
        </HeroTitle>

        <HeroDivider />

        <HeroBody>
          <HeroItem>
            <HeroItemLabel>
              <Clock /> Time Stamp
            </HeroItemLabel>
            {renderTimestamp(timestamp)}
          </HeroItem>

          <div className="grid grid-cols-3 gap-6">
            <HeroItem>
              <HeroItemLabel>
                <Cpu /> Size
              </HeroItemLabel>
              {formatNumber(size)} bytes
            </HeroItem>

            <HeroItem>
              <HeroItemLabel>
                <Layers /> Slot
              </HeroItemLabel>
              {formatNumber(timestampToSlot(timestamp))}
            </HeroItem>

            <HeroItem>
              <HeroItemLabel>
                <BookOpen /> Epoch
              </HeroItemLabel>
              {formatNumber(timestampToEpoch(timestamp))}
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
            <TrendingUp /> Zero-knowledge proofs
          </h2>
          <div className="grid grid-cols-2 gap-x-8 sm:flex sm:flex-wrap">
            {performanceItems.map(({ label, description, value }) => (
              <MetricBox key={label}>
                <MetricLabel>
                  {label}
                  <MetricInfo>{description}</MetricInfo>
                </MetricLabel>
                <MetricValue>{value}</MetricValue>
              </MetricBox>
            ))}
          </div>
        </section>

        <section>
          <h2 className="flex items-center gap-2 text-lg font-normal text-primary">
            <DollarSign /> Block fees
          </h2>
          <div className="grid grid-cols-2 gap-x-8 sm:flex sm:flex-wrap">
            {blockFeeMetrics.map(({ label, description, value }) => (
              <MetricBox key={label}>
                <MetricLabel>
                  {label}
                  <MetricInfo>{description}</MetricInfo>
                </MetricLabel>
                <MetricValue>{value}</MetricValue>
              </MetricBox>
            ))}
          </div>
        </section>
      </div>

      <section>
        <h2 className="flex items-center gap-2 text-lg font-normal text-primary">
          <ProofCircle /> Proofs
        </h2>

        {proofs.map(
          ({
            proof_id,
            prover_duration,
            proving_cost,
            proving_cycles,
            user_id,
          }) => {
            const team = teams.find((t) => t.user_id === user_id)
            const imgProps = getProverLogoImgProps(team)
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
                    "relative flex h-14 w-40 self-center",
                    "col-span-3 col-start-1 row-span-1 row-start-1",
                    "sm:col-span-2 sm:col-start-1 sm:row-span-1 sm:row-start-1",
                    "md:col-span-1 md:col-start-1 md:row-span-1 md:row-start-1"
                  )}
                >
                  {imgProps && (
                    <Link href={"/prover/" + team?.team_id}>
                      <Image
                        src={imgProps.src}
                        alt={imgProps.alt}
                        fill
                        sizes="100vw"
                        className="object-contain object-left"
                      />
                    </Link>
                  )}
                </div>
                <Button
                  variant="outline"
                  className={cn(
                    "ms-auto h-8 w-8 min-w-fit gap-2 self-center text-2xl text-primary",
                    "col-span-1 col-start-4 row-span-1 row-start-1",
                    "sm:col-span-2 sm:col-start-3 sm:row-span-1 sm:row-start-1",
                    "md:col-span-1 md:col-start-6 md:row-span-1 md:row-start-1"
                  )}
                >
                  <ArrowDown />
                  <span className="hidden text-nowrap text-xs font-bold sm:block md:hidden lg:block">
                    Download proof
                  </span>
                </Button>
                <MetricBox
                  className={cn(
                    "col-span-2 col-start-1 row-span-1 row-start-2",
                    "sm:col-span-1 sm:col-start-1 sm:row-span-1 sm:row-start-2",
                    "md:col-span-1 md:col-start-2 md:row-span-1 md:row-start-1"
                  )}
                >
                  <MetricLabel>Time to proof</MetricLabel>
                  <MetricValue>{prover_duration as string}</MetricValue>
                </MetricBox>
                <MetricBox
                  className={cn(
                    "col-span-2 col-start-3 row-span-1 row-start-2",
                    "sm:col-span-1 sm:col-start-2 sm:row-span-1 sm:row-start-2",
                    "md:col-span-1 md:col-start-3 md:row-span-1 md:row-start-1"
                  )}
                >
                  <MetricLabel>Latency</MetricLabel>
                  <MetricValue>
                    {new Intl.NumberFormat("en-US", {
                      style: "unit",
                      unit: "second",
                      unitDisplay: "narrow",
                    }).format(intervalToSeconds(prover_duration as string))}
                  </MetricValue>
                </MetricBox>
                <MetricBox
                  className={cn(
                    "col-span-2 col-start-1 row-span-1 row-start-3",
                    "sm:col-span-1 sm:col-start-3 sm:row-span-1 sm:row-start-2",
                    "md:col-span-1 md:col-start-4 md:row-span-1 md:row-start-1"
                  )}
                >
                  <MetricLabel>zkVM cycles</MetricLabel>
                  <MetricValue>
                    {proving_cycles
                      ? new Intl.NumberFormat("en-US", {
                          // notation: "compact",
                          // compactDisplay: "short",
                        }).format(proving_cycles)
                      : ""}
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
                    Proving cost
                  </MetricLabel>
                  <MetricValue>
                    {proving_cost
                      ? new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD",
                        }).format(proving_cost)
                      : ""}
                  </MetricValue>
                </MetricBox>
              </div>
            )
          }
        )}
      </section>

      <LearnMore />
    </div>
  )
}
