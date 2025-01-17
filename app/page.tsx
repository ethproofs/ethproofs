import { asc } from "drizzle-orm"
import type { Metadata } from "next"
import Image from "next/image"
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query"

import type { SummaryItem } from "@/lib/types"

import BlocksTable from "@/components/BlocksTable"
import { metrics } from "@/components/Metrics"
import Null from "@/components/Null"
import Box from "@/components/svgs/box.svg"
import Clock from "@/components/svgs/clock.svg"
import DollarSign from "@/components/svgs/dollar-sign.svg"
import ShieldCheck from "@/components/svgs/shield-check.svg"
import TeamLogo from "@/components/TeamLogo"
import { ButtonLink } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Divider } from "@/components/ui/divider"

import { cn } from "@/lib/utils"

import { AVERAGE_LABEL, DEFAULT_PAGE_STATE } from "@/lib/constants"

import { db } from "@/db"
import {
  recentSummary as recentSummaryView,
  teamsSummary as teamsSummaryView,
} from "@/db/schema"
import { fetchBlocksPaginated } from "@/lib/api/blocks"
import { getMetadata } from "@/lib/metadata"
import { formatNumber, formatUsd } from "@/lib/number"
import { getActiveProverCount } from "@/lib/teams"
import { prettyMs } from "@/lib/time"
import HeroDark from "@/public/images/hero-background.png"

export const metadata: Metadata = getMetadata()

export default async function Index() {
  const queryClient = new QueryClient()

  const [recentSummary] = await db.select().from(recentSummaryView)

  const teamsSummary = await db
    .select()
    .from(teamsSummaryView)
    .orderBy(asc(teamsSummaryView.avg_proving_time))

  const teams = await db.query.teams.findMany()

  await queryClient.prefetchQuery({
    queryKey: ["blocks", DEFAULT_PAGE_STATE],
    queryFn: () => fetchBlocksPaginated(DEFAULT_PAGE_STATE),
  })

  const summaryItems: SummaryItem[] = recentSummary
    ? [
        {
          key: "proven-blocks",
          label: "Proven blocks",
          icon: <Box />,
          value: formatNumber(recentSummary.total_proven_blocks || 0),
        },
        {
          key: "avg-cost-per-proof",
          label: (
            <>
              {AVERAGE_LABEL} <metrics.costPerProof.Label />
            </>
          ),
          icon: <DollarSign />,
          value: formatUsd(recentSummary.avg_cost_per_proof || 0).replace(
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
          value: prettyMs(Number(recentSummary.avg_proving_time) || 0),
        },
      ]
    : []

  return (
    <div className="flex w-full flex-1 flex-col items-center gap-20">
      <div
        className="absolute inset-0 -z-10 h-[14rem] md:max-xl:h-96 xl:h-[22rem]"
        style={{ mask: "linear-gradient(180deg, white 80%, transparent)" }}
      >
        <Image
          src={HeroDark}
          style={{
            mask: "radial-gradient(circle, white 60%, transparent 90%)",
            objectPosition: "50% 35%", // Position around checkmark in image
          }}
          className={cn(
            "mx-auto h-full w-full max-w-screen-2xl object-cover",
            "opacity-80 contrast-[110%] hue-rotate-180 invert", // Light mode filters
            "dark:opacity-100 dark:contrast-100 dark:hue-rotate-0 dark:invert-0" // Dark mode filter resets
          )}
          alt=""
        />
      </div>
      <div className="sm:mt-18 mt-10 flex w-full flex-col items-center justify-between gap-4 p-3 md:mt-36 xl:mt-36">
        <h1 className="w-full text-center font-mono font-semibold">
          SNARKs that scale <span className="text-primary">Ethereum</span>
        </h1>
        <p className="max-w-2xl text-center text-2xl">
          Progressing towards fully{" "}
          <span className="text-primary">SNARKing the L1</span>
        </p>
        <p className="mb-4 max-w-2xl text-center text-lg">
          Starting by proving 1-of-100 blocks and soon{" "}
          <span className="text-primary">real time proving</span>
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
        <HydrationBoundary state={dehydrate(queryClient)}>
          <BlocksTable teams={teams} />
        </HydrationBoundary>
      </section>

      <section className="w-full scroll-m-20 space-y-8" id="provers">
        <div>
          <h2>Provers</h2>
          <Divider className="h-0.5" />
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
          {teamsSummary && (
            <div className="flex flex-1 flex-col items-center gap-2">
              <div className="whitespace-nowrap text-sm font-bold uppercase text-body">
                Prover diversity
              </div>
              <div className="flex items-center gap-2 whitespace-nowrap text-4xl text-primary">
                <ShieldCheck /> {getActiveProverCount(teamsSummary)}
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
          {teamsSummary &&
            teamsSummary.map(
              ({
                team_id,
                logo_url,
                team_name,
                slug,
                avg_cost_per_proof,
                avg_proving_time,
              }) => {
                const isNewTeam = !avg_cost_per_proof || !avg_proving_time
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
                      {isNewTeam ? (
                        <div className="py-8 text-center font-mono text-lg uppercase text-body-secondary">
                          Proving soon
                        </div>
                      ) : (
                        <>
                          <div className="flex w-full flex-nowrap">
                            <div className="flex flex-col items-center gap-2 px-4">
                              <div className="flex items-center gap-1 text-body-secondary">
                                {AVERAGE_LABEL} <metrics.provingTime.Label />
                              </div>
                              <div className="font-mono text-lg">
                                {prettyMs(Number(avg_proving_time) || 0)}
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
                          <ButtonLink
                            href={`/prover/${slug}`}
                            variant="outline"
                          >
                            + details for {team_name}
                          </ButtonLink>
                        </>
                      )}
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
