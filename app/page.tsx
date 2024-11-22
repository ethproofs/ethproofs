import type { Metadata } from "next"
import Image from "next/image"

import type { SummaryItem } from "@/lib/types"

import BlocksTable from "@/components/BlocksTable"
import Block from "@/components/svgs/box.svg"
import Clock from "@/components/svgs/clock.svg"
import DollarSign from "@/components/svgs/dollar-sign.svg"

import { cn } from "@/lib/utils"

import { getMetadata } from "@/lib/metadata"
import { formatNumber } from "@/lib/number"
import HeroDark from "@/public/images/hero-background.png"
import { createClient } from "@/utils/supabase/server"

export const metadata: Metadata = getMetadata()

export default async function Index() {
  const supabase = createClient({
    global: {
      fetch: (input, init) =>
        fetch(input, {
          ...init,
          cache: "force-cache",
          next: { tags: ["blocks", "proofs"] },
        }),
    },
  })

  const summary = await supabase.from("recent_summary").select().single()

  const blocksResponse = await supabase
    .from("blocks")
    .select(`*,proofs!inner(id:proof_id)`)
    .order("block_number", { ascending: false })

  const blocks = blocksResponse.data || []

  const proofsResponse = await supabase.from("proofs").select()
  const proofs = proofsResponse.data || []

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
      <div
        className="absolute inset-0 -z-10 h-[28rem] md:max-xl:h-96"
        style={{ mask: "linear-gradient(180deg, white 80%, transparent)" }}
      >
        <Image
          src={HeroDark}
          style={{
            mask: "radial-gradient(circle, white 60%, transparent 90%)",
            objectPosition: "50% 30%", // Position around checkmark in image
          }}
          className={cn(
            "mx-auto h-full w-full max-w-screen-2xl object-cover",
            "opacity-80 contrast-[110%] hue-rotate-180 invert", // Light mode filters
            "dark:opacity-100 dark:contrast-100 dark:hue-rotate-0 dark:invert-0" // Dark mode filter resets
          )}
          alt=""
        />
      </div>
      <div className="mt-56 flex w-full flex-col items-center justify-between gap-4 p-3 md:mt-44 xl:mt-64">
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

      <section id="blocks" className="w-full scroll-m-20">
        <BlocksTable blocks={blocks || []} proofs={proofs} />
      </section>
    </div>
  )
}
