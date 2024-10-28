import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import ArrowDown from "@/components/svgs/arrow-down.svg"
import BlockLarge from "@/components/svgs/block-large.svg"
import BookOpen from "@/components/svgs/book-open.svg"
import Clock from "@/components/svgs/clock.svg"
import Copy from "@/components/svgs/copy.svg"
import Cpu from "@/components/svgs/cpu.svg"
import DollarSign from "@/components/svgs/dollar-sign.svg"
import EthProofsLogo from "@/components/svgs/eth-proofs-logo.svg"
import Hash from "@/components/svgs/hash.svg"
import InfoCircle from "@/components/svgs/info-circle.svg"
import Layers from "@/components/svgs/layers.svg"
import ProofCircle from "@/components/svgs/proof-circle.svg"
import RiscZeroLogo from "@/components/svgs/risc-zero-logo.svg"
import SuccinctLogo from "@/components/svgs/succinct-logo.svg"
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import LearnMore from "@/components/LearnMore"

import { SITE_NAME } from "@/lib/constants"
import { intervalToSeconds } from "@/lib/date"

import { createClient } from "@/utils/supabase/client"

const getProverLogo = (proverMachineId: number | null) => {
  // TODO: Get prover profiles
  switch (proverMachineId) {
    case 8:
      return <SuccinctLogo />
    case 2:
      return <RiscZeroLogo />
    default:
      return <EthProofsLogo />
  }
}

type BlockDetailsPageProps = {
  params: Promise<{ block: number }>
}

export async function generateMetadata({
  params,
}: BlockDetailsPageProps): Promise<Metadata> {
  const { block } = await params
  return {
    title: `Block ${block} - ${SITE_NAME}`,
  }
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

  if (!data || error) notFound()

  const { timestamp, gas_used, transaction_count, proofs } = data

  // TODO: Get merkle root hash, slot (epoch), and size block data
  // Dummy data:
  const size = 32735
  const slot = 9859329
  const hash =
    "0xdead1d25076fd31b221cff08ae4f5e3e1acf8e616bcdc5cf7b36f2b60983dead"
  const dummyNumber = 60420

  const avgLatency =
    proofs.reduce(
      (acc, proof) => acc + intervalToSeconds(proof.prover_duration as string),
      0
    ) / proofs.length

  // TODO: Confirm logic
  const totalCostPerMegaGas =
    proofs.reduce((acc, proof) => acc + (proof.proving_cost || 0), 0) /
    gas_used /
    1e6

  return (
    <div className="space-y-8">
      <HeroSection>
        <HeroTitle>
          <BlockLarge className="text-6xl text-primary" />
          <h1 className="font-mono">
            <p className="text-sm font-normal md:text-lg">Block Height</p>
            <p className="text-3xl font-semibold">
              {/* {new Intl.NumberFormat("en-US").format()} */}
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
            {new Intl.DateTimeFormat("en-US", {
              dateStyle: "short",
              timeStyle: "long",
              timeZone: "UTC",
            }).format(new Date(timestamp))}
          </HeroItem>

          <div className="grid grid-cols-3 gap-6">
            <HeroItem>
              <HeroItemLabel>
                <Cpu /> Size
              </HeroItemLabel>
              {new Intl.NumberFormat("en-US").format(size)} bytes
            </HeroItem>

            <HeroItem>
              <HeroItemLabel>
                <Layers /> Slot
              </HeroItemLabel>
              {/* {new Intl.NumberFormat("en-US").format(slot)} */}
              {slot}
            </HeroItem>

            <HeroItem>
              <HeroItemLabel>
                <BookOpen /> Epoch
              </HeroItemLabel>
              {/* {new Intl.NumberFormat("en-US").format(slot)} */}
              {slot}
            </HeroItem>
          </div>

          <HeroItem>
            <HeroItemLabel>
              <Hash /> Hash
            </HeroItemLabel>
            <div className="flex gap-2">
              <div className="max-w-[min(theme.80 truncate">{hash}</div>
              {/* TODO: Implement useClipboard */}
              <Button size="icon" variant="ghost" className="text-primary-dark">
                <Copy />
              </Button>
            </div>
          </HeroItem>
        </HeroBody>
      </HeroSection>

      <section>
        <h2 className="flex items-center gap-2 text-lg font-normal text-primary">
          <TrendingUp /> Zero-knowledge proofs
        </h2>
        <div className="flex flex-wrap gap-x-8">
          <div className="space-y-0.5 px-2 py-3">
            <div className="flex items-center gap-2 text-sm text-body-secondary">
              Total proofs
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <InfoCircle />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>TODO: Add tooltip info</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="text-2xl font-semibold">{proofs.length}</div>
          </div>
          <div className="space-y-0.5 px-2 py-3">
            <div className="flex items-center gap-2 text-sm text-body-secondary">
              Avg latency
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <InfoCircle />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>TODO: Add tooltip info</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="text-2xl font-semibold">
              {new Intl.NumberFormat("en-US", {
                style: "unit",
                unit: "second",
                unitDisplay: "narrow",
              }).format(avgLatency)}
            </div>
          </div>
          <div className="space-y-0.5 px-2 py-3">
            <div className="flex items-center gap-2 text-sm text-body-secondary">
              Gas used
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <InfoCircle />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>TODO: Add tooltip info</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="text-2xl font-semibold">
              {new Intl.NumberFormat("en-US").format(gas_used)}
            </div>
          </div>
          <div className="space-y-0.5 px-2 py-3">
            <div className="flex items-center gap-2 text-sm text-body-secondary">
              Transaction count
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <InfoCircle />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>TODO: Add tooltip info</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="text-2xl font-semibold">
              {new Intl.NumberFormat("en-US").format(transaction_count)}
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="flex items-center gap-2 text-lg font-normal text-primary">
          <DollarSign /> Block fees
        </h2>
        <div className="flex flex-wrap gap-x-8">
          <div className="space-y-0.5 px-2 py-3">
            <div className="flex items-center gap-2 text-sm text-body-secondary">
              Total fees
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <InfoCircle />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>TODO: Add tooltip info</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="text-2xl font-semibold">
              {new Intl.NumberFormat("en-US").format(dummyNumber)}
            </div>
          </div>
          <div className="space-y-0.5 px-2 py-3">
            <div className="flex items-center gap-2 text-sm text-body-secondary">
              Avg cost / Proof
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <InfoCircle />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>TODO: Add tooltip info</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="text-2xl font-semibold">
              {new Intl.NumberFormat("en-US").format(dummyNumber)}
            </div>
          </div>
          <div className="space-y-0.5 px-2 py-3">
            <div className="flex items-center gap-2 text-sm text-body-secondary">
              Cost / Mega gas
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <InfoCircle />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>TODO: Add tooltip info</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="text-2xl font-semibold">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(totalCostPerMegaGas)}
            </div>
          </div>
          <div className="space-y-0.5 px-2 py-3">
            <div className="flex items-center gap-2 text-sm text-body-secondary">
              Cost / Mcycl
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <InfoCircle />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>TODO: Add tooltip info</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="text-2xl font-semibold">
              {new Intl.NumberFormat("en-US").format(dummyNumber)}
            </div>
          </div>
          <div className="space-y-0.5 px-2 py-3">
            <div className="flex items-center gap-2 text-sm text-body-secondary">
              Cost / Transaction
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <InfoCircle />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>TODO: Add tooltip info</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="text-2xl font-semibold">
              {new Intl.NumberFormat("en-US").format(dummyNumber)}
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="flex items-center gap-2 text-lg font-normal text-primary">
          <ProofCircle /> Proofs
        </h2>

        {proofs.map(
          ({
            proof,
            proof_id,
            proof_status,
            prover_duration,
            prover_machine_id,
            proving_cost,
            proving_cycles,
            submission_time,
            user_id,
          }) => (
            <div className="space-y-4 border-b py-4">
              <div className="flex items-center">
                <div className="py-2">{getProverLogo(prover_machine_id)}</div>
                <Button
                  variant="outline"
                  className="ms-auto h-8 w-8 gap-2 text-2xl text-primary md:w-fit"
                >
                  <ArrowDown />
                  <span className="text-xs font-bold max-md:hidden">
                    Download proof
                  </span>
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-x-2 gap-y-6 md:grid-cols-4 lg:grid-cols-5">
                <div>
                  <div className="text-body-secondary">Time to proof</div>
                  <div className="text-2xl">{prover_duration as string}</div>
                </div>
                <div>
                  <div className="text-body-secondary">Latency</div>
                  <div className="text-2xl">
                    {new Intl.NumberFormat("en-US", {
                      style: "unit",
                      unit: "second",
                      unitDisplay: "narrow",
                    }).format(intervalToSeconds(prover_duration as string))}
                  </div>
                </div>
                <div>
                  <div className="text-body-secondary">zkVM cycles</div>
                  <div className="text-2xl">
                    {proving_cycles
                      ? new Intl.NumberFormat("en-US", {
                          // notation: "compact",
                          // compactDisplay: "short",
                        }).format(proving_cycles)
                      : ""}
                  </div>
                </div>
                <div>
                  <div className="text-body-secondary">Proving cost</div>
                  <div className="text-2xl">
                    {/* TODO: Confirm cost unit */}
                    {proving_cost
                      ? new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD",
                        }).format(proving_cost)
                      : ""}
                  </div>
                </div>
              </div>
            </div>
          )
        )}
      </section>

      <LearnMore />
    </div>
  )
}
