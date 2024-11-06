import type { Metadata } from "next"
import Image from "next/image"

import type { SummaryItem } from "@/lib/types"

import BlocksTable from "@/components/BlocksTable"
import Block from "@/components/svgs/box.svg"
import Clock from "@/components/svgs/clock.svg"
import DollarSign from "@/components/svgs/dollar-sign.svg"

import HeroDark from "@/assets/hero-background-dark.png"
import HeroLight from "@/assets/hero-background-light.png"
import { getMetadata } from "@/lib/metadata"
import { formatNumber } from "@/lib/number"
import { createClient } from "@/utils/supabase/server"

export const metadata: Metadata = getMetadata()

export default async function Index() {
  const supabase = createClient()

  const summary = await supabase.from("recent_summary").select().single()

  const blocksResponse = await supabase
    .from("blocks")
    .select(`*,proofs!inner(id:proof_id, *)`)
    .eq("proofs.proof_status", "proved")

  const provenBlocks = blocksResponse.data || []

  const summaryItems: SummaryItem[] = summary.data
    ? [
        {
          label: "Proven blocks",
          icon: <Block />,
          value: formatNumber(summary.data?.total_proven_blocks || 0),
        },
        {
          label: "Avg cost per proof",
          icon: <DollarSign />,
          value: formatNumber(summary.data?.avg_cost_per_proof || 0, {
            maximumFractionDigits: 2,
          }),
        },
        {
          label: "Avg proof latency",
          icon: <Clock />,
          value: formatNumber(summary.data?.avg_proof_latency || 0, {
            style: "unit",
            unit: "second",
            unitDisplay: "narrow",
            maximumFractionDigits: 0,
          }),
        },
      ]
    : []

  return (
    <div className="flex w-full flex-1 flex-col items-center gap-20">
      <Image
        src={HeroDark}
        className="absolute inset-0 -z-10 hidden min-h-96 object-cover dark:block"
        alt=""
      />
      <Image
        src={HeroLight}
        className="absolute inset-0 -z-10 min-h-96 object-cover dark:hidden"
        alt=""
      />
      <div className="mt-60 flex w-full flex-col items-center justify-between gap-4 p-3 md:mt-48 xl:mt-72">
        <h1 className="w-full text-center font-mono font-semibold">
          Building fully SNARKed <span className="text-primary">Ethereum</span>
        </h1>
        <p className="max-w-2xl text-center text-lg">
          This is a proof of concept that ZK proves 1-of-N blocks. Eventually,
          it will enable full ZK light clients on any smartphone.
        </p>
        <div className="flex w-full max-w-2xl justify-around">
          {summaryItems.map(({ label, icon, value }) => (
            <div key={label} className="flex flex-col gap-1 p-2">
              <div className="flex flex-col items-center justify-center gap-x-2 md:flex-row">
                <p className="font-mono text-2xl text-primary md:text-3xl lg:text-4xl">
                  {icon}
                </p>
                <p className="font-mono text-2xl text-primary md:text-3xl lg:text-4xl">
                  {value}
                </p>
              </div>
              <div>
                <p className="text-center text-xs uppercase md:text-sm">
                  {label}
                </p>
              </div>
              <p className="text-center text-xs font-bold uppercase text-body-secondary">
                Last 30 days
              </p>
            </div>
          ))}
        </div>
      </div>

      <BlocksTable blocks={provenBlocks} />
    </div>
  )
}
