import type { Metadata } from "next"
import Image from "next/image"

import BlocksTable from "@/components/BlocksTable"
import Block from "@/components/svgs/box.svg"
import Clock from "@/components/svgs/clock.svg"
import DollarSign from "@/components/svgs/dollar-sign.svg"

import HeroDark from "@/assets/hero-background-dark.png"
import HeroLight from "@/assets/hero-background-light.png"
import { blockIsProven, blockIsRecent } from "@/lib/blocks"
import { getMetadata } from "@/lib/metadata"
import { formatNumber } from "@/lib/number"
import {
  filterRecentProven,
  getProofsAvgCost,
  getProofsAvgLatency,
} from "@/lib/proofs"
import { createClient } from "@/utils/supabase/server"

export const metadata: Metadata = getMetadata()

export default async function Index() {
  const supabase = createClient()
  const blocksResponse = await supabase.from("blocks").select(`
      *,
      proofs:proofs(
        id:proof_id
      )
    `)
  const blocks = blocksResponse.data || []

  const proofsResponse = await supabase.from("proofs").select()
  const proofs = proofsResponse.data || []

  const provenBlocks = blocks.filter((block) => blockIsProven(block, proofs))
  const provenBlocksRecent = provenBlocks.filter(blockIsRecent) // For summary

  const totalBlocksProvenRecent = provenBlocksRecent.length

  const proofsRecent = filterRecentProven(proofs)

  const avgCostPerProofRecent = formatNumber(getProofsAvgCost(proofsRecent), {
    maximumFractionDigits: 2,
  })

  const avgLatencyPerProofRecent = formatNumber(
    getProofsAvgLatency(proofsRecent),
    {
      style: "unit",
      unit: "second",
      unitDisplay: "narrow",
      maximumFractionDigits: 0,
    }
  )

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
          <div className="flex flex-col gap-1 p-2">
            <div className="flex flex-col items-center justify-center gap-x-2 md:flex-row">
              <p className="font-mono text-2xl text-primary md:text-3xl lg:text-4xl">
                <Block />
              </p>
              <p className="font-mono text-2xl text-primary md:text-3xl lg:text-4xl">
                {totalBlocksProvenRecent}
              </p>
            </div>
            <div>
              <p className="text-center text-xs uppercase md:text-sm">
                Proven blocks
              </p>
            </div>
            <p className="text-center text-xs font-bold uppercase text-body-secondary">
              Last 30 days
            </p>
          </div>
          <div className="flex flex-col gap-1 p-2">
            <div className="flex flex-col items-center justify-center gap-x-2 md:flex-row">
              <p className="font-mono text-2xl text-primary md:text-3xl lg:text-4xl">
                <DollarSign />
              </p>
              <p className="font-mono text-2xl text-primary md:text-3xl lg:text-4xl">
                {avgCostPerProofRecent}
              </p>
            </div>
            <div>
              <p className="text-center text-xs uppercase md:text-sm">
                Avg cost per proof
              </p>
            </div>
            <p className="text-center text-xs font-bold uppercase text-body-secondary">
              Last 30 days
            </p>
          </div>
          <div className="flex flex-col gap-1 p-2">
            <div className="flex flex-col items-center justify-center gap-x-2 md:flex-row">
              <p className="font-mono text-2xl text-primary md:text-3xl lg:text-4xl">
                <Clock />
              </p>
              <p className="font-mono text-2xl text-primary md:text-3xl lg:text-4xl">
                {avgLatencyPerProofRecent}
              </p>
            </div>
            <div>
              <p className="text-center text-xs uppercase md:text-sm">
                Avg proof latency
              </p>
            </div>
            <p className="text-center text-xs font-bold uppercase text-body-secondary">
              Last 30 days
            </p>
          </div>
        </div>
      </div>

      <BlocksTable blocks={provenBlocks || []} proofs={proofs} />
    </div>
  )
}
