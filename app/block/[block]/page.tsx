import type { Metadata } from "next"
import Link from "next/link"

import ArrowDown from "@/components/svgs/arrow-down.svg"
import BlockLarge from "@/components/svgs/block-large.svg"
import BookOpen from "@/components/svgs/book-open.svg"
import Clock from "@/components/svgs/clock.svg"
import Copy from "@/components/svgs/copy.svg"
import Cpu from "@/components/svgs/cpu.svg"
import DollarSign from "@/components/svgs/dollar-sign.svg"
import Hash from "@/components/svgs/hash.svg"
import InfoCircle from "@/components/svgs/info-circle.svg"
import Layers from "@/components/svgs/layers.svg"
import ProofCircle from "@/components/svgs/proof-circle.svg"
import RiscZeroLogo from "@/components/svgs/risc-zero-logo.svg"
import SuccinctLogo from "@/components/svgs/succinct-logo.svg"
import TrendingUp from "@/components/svgs/trending-up.svg"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { formatTimeAgo } from "@/lib/date"

type BlockDetailsPageProps = {
  params: Promise<{ block: number }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

import { SITE_NAME } from "@/lib/constants"

type Props = {
  params: Promise<{ block: number }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { block } = await params
  return {
    title: `Block ${block} - ${SITE_NAME}`,
  }
}

export default async function BlockDetailsPage({
  params,
}: BlockDetailsPageProps) {
  const { block } = await params

  // Dummy data
  const timestamp = Date.now()
  const size = 32735
  const slot = 9859329
  const hash =
    "0xdead1d25076fd31b221cff08ae4f5e3e1acf8e616bcdc5cf7b36f2b60983dead"
  const dummyNumber = 60420
  const totalProofs = 2
  const avgLatency = "42s"
  const gasUsed = "1 gwei"
  const provingCost = 0.07
  const zkVmCycles = 2_391_801_856

  return (
    <div className="space-y-8">
      <section className="rounded-4xl border bg-gradient-to-b from-primary/[0.02] to-primary/[0.06] px-2 py-6 dark:from-white/[0.01] dark:to-white/[0.04] md:p-8">
        <div className="flex gap-2">
          <BlockLarge className="text-6xl text-primary" />
          <h1 className="font-mono">
            <p className="text-sm font-normal md:text-lg">Block Height</p>
            <p className="text-3xl font-semibold">
              {/* {new Intl.NumberFormat("en-US").format()} */}
              {block}
            </p>
          </h1>
        </div>

        <div className="my-8 h-px w-full bg-gradient-to-r from-primary" />

        <div className="flex flex-wrap gap-x-6 gap-y-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1 text-body-secondary">
              <Clock /> Time Stamp
            </div>
            {new Intl.DateTimeFormat("en-US", {
              dateStyle: "short",
              timeStyle: "long",
              timeZone: "UTC",
            }).format(new Date(timestamp))}
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1 text-body-secondary">
                <Cpu /> Size
              </div>
              {new Intl.NumberFormat("en-US").format(size)} bytes
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-1 text-body-secondary">
                <Layers /> Slot
              </div>
              {/* {new Intl.NumberFormat("en-US").format(slot)} */}
              {slot}
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-1 text-body-secondary">
                <BookOpen /> Epoch
              </div>
              {/* {new Intl.NumberFormat("en-US").format(slot)} */}
              {slot}
            </div>
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-1 text-body-secondary">
              <Hash /> Hash
            </div>
            <div className="flex gap-2">
              <div className="max-w-[min(theme.80 truncate">{hash}</div>
              {/* TODO: Implement useClipboard */}
              <Button size="icon" variant="ghost" className="text-primary-dark">
                <Copy />
              </Button>
            </div>
          </div>
        </div>
      </section>

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
            <div className="text-2xl font-semibold">{totalProofs}</div>
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
            <div className="text-2xl font-semibold">{avgLatency}</div>
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
            <div className="text-2xl font-semibold">{gasUsed}</div>
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
              {new Intl.NumberFormat("en-US").format(dummyNumber)}
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
              {new Intl.NumberFormat("en-US").format(dummyNumber)}
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

        <div className="space-y-4 border-b py-4">
          <div className="flex items-center">
            <div className="px-4 py-2">
              <SuccinctLogo />
            </div>
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
              <div className="text-2xl">2m 36s</div>
            </div>
            <div>
              <div className="text-body-secondary">Latency</div>
              <div className="text-2xl">211s</div>
            </div>
            <div>
              <div className="text-body-secondary">zkVM cycles</div>
              <div className="text-2xl">
                {new Intl.NumberFormat("en-US", {
                  // notation: "compact",
                  // compactDisplay: "short",
                }).format(zkVmCycles)}
              </div>
            </div>
            <div>
              <div className="text-body-secondary">Proving cost</div>
              <div className="text-2xl">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(provingCost)}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 border-b py-4">
          <div className="flex items-center">
            <div className="px-4 py-2">
              <RiscZeroLogo />
            </div>
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
              <div className="text-2xl">2m 36s</div>
            </div>
            <div>
              <div className="text-body-secondary">Latency</div>
              <div className="text-2xl">211s</div>
            </div>
            <div>
              <div className="text-body-secondary">zkVM cycles</div>
              <div className="text-2xl">
                {new Intl.NumberFormat("en-US", {
                  // notation: "compact",
                  // compactDisplay: "short",
                }).format(zkVmCycles)}
              </div>
            </div>
            <div>
              <div className="text-body-secondary">Proving cost</div>
              <div className="text-2xl">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(provingCost)}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mt-32 text-5xl">Learn</h2>
        <div className="h-px w-full bg-gradient-to-r from-primary" />
        <div className="my-16 grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div className="rounded-4xl flex w-full flex-col gap-8 border-2 border-body/20 px-4 py-12">
            {/* TODO: Add card backgrounds */}
            <h3 className="max-w-72 text-3xl md:max-w-96">
              Why do we need to verify each block?
            </h3>
            <Link href="/TODO-ADD-LINK" className="font-body">
              Learn more
            </Link>
          </div>

          <div className="rounded-4xl flex w-full flex-col gap-8 border-2 border-body/20 bg-background px-4 py-12">
            {/* TODO: Add card backgrounds */}
            <h3 className="max-w-72 text-3xl md:max-w-96">
              How do the proofs work?
            </h3>
            <Link href="/TODO-ADD-LINK" className="font-body">
              Learn more
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
