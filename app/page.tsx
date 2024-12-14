import type { Metadata } from "next"
import Image from "next/image"

import type { BlockBase, Proof, SummaryItem } from "@/lib/types"

import BlocksTable from "@/components/BlocksTable"
import { metrics } from "@/components/Metrics"
import Null from "@/components/Null"
import Box from "@/components/svgs/box.svg"
import CentSign from "@/components/svgs/cent-sign.svg"
import Clock from "@/components/svgs/clock.svg"
import DollarSign from "@/components/svgs/dollar-sign.svg"
import ShieldCheck from "@/components/svgs/shield-check.svg"
import TeamLogo from "@/components/TeamLogo"
import { ButtonLink } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

import { cn } from "@/lib/utils"

import { AVERAGE_LABEL } from "@/lib/constants"

import { getMetadata } from "@/lib/metadata"
import { formatNumber, formatUsd, shouldUseCents } from "@/lib/number"
import { prettyMs } from "@/lib/time"
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

  const recentSummary = await supabase.from("recent_summary").select().single()

  const teamsSummary = await supabase
    .from("teams_summary")
    .select()
    .filter("avg_proving_time", "is", null)
    .order("avg_proving_time", { ascending: true })

  const blocksResponse = await supabase
    .from("blocks")
    .select(
      `*,proofs!inner(id:proof_id,*,
        cluster:clusters(*,
          cluster_configurations(*,
            aws_instance_pricing(*)
          )
        )
      )`
    )
    .order("block_number", { ascending: false })
  const blocks = (blocksResponse.data || []) satisfies BlockBase[]

  const teamsResponse = await supabase.from("teams").select()
  const teams = teamsResponse.data || []

  const blocksProofsTeams = blocks.map((block) => {
    const { proofs } = block
    const proofsWithTeams = proofs.map((proof) => ({
      ...proof,
      team: teams.find((team) => team.user_id === proof.user_id),
    })) as Proof[]

    return { ...block, proofs: proofsWithTeams }
  })

  const summaryItems: SummaryItem[] = recentSummary.data
    ? [
        {
          key: "proven-blocks",
          label: "Proven blocks",
          icon: <Box />,
          value: formatNumber(recentSummary.data?.total_proven_blocks || 0),
        },
        {
          key: "avg-cost-per-proof",
          label: (
            <>
              {AVERAGE_LABEL} <metrics.costPerProof.Label />
            </>
          ),
          icon: shouldUseCents(recentSummary.data?.avg_cost_per_proof) ? (
            <CentSign />
          ) : (
            <DollarSign />
          ),
          value: formatUsd(recentSummary.data?.avg_cost_per_proof || 0).replace(
            /[¢$]/g,
            ""
          ),
        },
        {
          key: "avg-proving-time",
          label: (
            <>
              {AVERAGE_LABEL} <metrics.provingTime.Label />
            </>
          ),
          icon: <Clock />,
          value: prettyMs(recentSummary.data?.avg_proving_time || 0),
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
          Building a fully SNARKed{" "}
          <span className="text-primary">Ethereum</span>
        </h1>
        <p className="max-w-2xl text-center text-lg">
          This is a proof of concept that ZK proves 1-of-N blocks. Eventually,
          it will enable full ZK light clients on any smartphone.
        </p>
        <div className="flex w-full max-w-2xl justify-around">
          {summaryItems.map(({ key, label, icon, value }) => (
            <div key={key} className="flex flex-col gap-1 p-2">
              <div className="flex flex-col items-center justify-center gap-x-2 md:flex-row">
                <p className="font-mono text-2xl text-primary md:text-3xl lg:text-4xl">
                  {icon}
                </p>
                <p className="text-center font-mono text-2xl text-primary md:text-3xl lg:text-4xl">
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
        <BlocksTable blocks={blocksProofsTeams} />
      </section>

      <section className="w-full scroll-m-20 space-y-8" id="provers">
        <div>
          <h2>Provers</h2>
          <div className="h-0.5 w-full bg-gradient-to-r from-primary" />
        </div>
        <div className="flex flex-col-reverse gap-8 sm:flex-row">
          <div className="flex-1">
            <p className="mb-auto">
              Provers demonstrate they know a secret or have completed a
              computation correctly without revealing the actual secret or
              computation details. The verifiers then can check this proof and
              be confident that the prover is telling the truth without needing
              to see the private data. In the context of this project, the
              proofs are representing that a certain block has been valid.
            </p>
          </div>
          {teamsSummary.data && (
            <div className="flex flex-1 flex-col items-center gap-2">
              <div className="whitespace-nowrap text-sm font-bold uppercase text-body">
                Prover diversity
              </div>
              <div className="flex items-center gap-2 whitespace-nowrap text-4xl text-primary">
                <ShieldCheck /> {teamsSummary.data.length}
              </div>
              <div className="whitespace-nowrap text-xs font-bold uppercase text-body-secondary">
                Prover vendors
              </div>
            </div>
          )}
        </div>
        <div
          className="grid gap-8"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(24rem, 1fr))",
          }}
        >
          {teamsSummary.data &&
            teamsSummary.data.map(
              ({
                team_id,
                logo_url,
                team_name,
                avg_cost_per_proof,
                avg_proving_time,
              }) => {
                console.log({})
                return (
                  <Card
                    className="flex min-w-96 flex-1 flex-col gap-4"
                    key={team_id}
                  >
                    <div className="relative mx-auto flex h-20 w-56 justify-center">
                      <TeamLogo
                        src={logo_url}
                        alt={team_name || "Prover logo"}
                        className={cn(
                          "object-center",
                          !logo_url && "opacity-50"
                        )}
                      />
                      <h3
                        className={cn(
                          "absolute inset-0 grid place-items-center text-3xl",
                          logo_url && "sr-only"
                        )}
                      >
                        {team_name}
                      </h3>
                    </div>

                    <div className="mx-auto flex flex-col gap-6">
                      <div className="flex w-full flex-nowrap">
                        <div className="flex flex-col items-center gap-2 px-4">
                          <div className="flex items-center gap-1 text-body-secondary">
                            {AVERAGE_LABEL} <metrics.provingTime.Label />
                          </div>
                          <div className="font-mono text-lg">
                            {prettyMs(avg_proving_time || 0)}
                          </div>
                        </div>
                        <div className="flex flex-col items-center gap-2 px-4">
                          <div className="flex items-center gap-1 text-body-secondary">
                            {AVERAGE_LABEL} <metrics.costPerProof.Label />
                          </div>
                          <div className="font-mono text-lg">
                            {avg_cost_per_proof !== null &&
                            avg_cost_per_proof !== 0 &&
                            isFinite(avg_cost_per_proof) ? (
                              formatUsd(avg_cost_per_proof)
                            ) : (
                              <Null />
                            )}
                          </div>
                        </div>
                      </div>
                      <ButtonLink href={`/prover/${team_id}`} variant="outline">
                        + details for {team_name}
                      </ButtonLink>
                    </div>
                  </Card>
                )
              }
            )}
        </div>
      </section>
    </div>
  )
}
