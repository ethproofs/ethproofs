import { asc, notIlike } from "drizzle-orm"
import type { Metadata } from "next"
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query"

import BlocksTable from "@/components/BlocksTable"
import LineChartCard from "@/components/LineChartCard"
import { metrics } from "@/components/Metrics"
import Null from "@/components/Null"
import Instructions from "@/components/svgs/instructions.svg"
import ShieldCheck from "@/components/svgs/shield-check.svg"
import TeamLogo from "@/components/TeamLogo"
import { ButtonLink } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Divider } from "@/components/ui/divider"
import ZkvmAccordion from "@/components/ZkvmAccordion"

import { cn } from "@/lib/utils"

import { AVERAGE_LABEL, DEFAULT_PAGE_STATE } from "@/lib/constants"

import { db } from "@/db"
import {
  recentSummary as recentSummaryView,
  teamsSummary as teamsSummaryView,
} from "@/db/schema"
import { fetchBlocksPaginated } from "@/lib/api/blocks"
import { getMetadata } from "@/lib/metadata"
import { formatUsd } from "@/lib/number"
import { getActiveProverCount } from "@/lib/teams"
import { prettyMs } from "@/lib/time"

export const metadata: Metadata = getMetadata()

export default async function Index() {
  const queryClient = new QueryClient()

  const teamsSummary = await db
    .select()
    .from(teamsSummaryView)
    // hide test teams from the provers list
    .where(notIlike(teamsSummaryView.team_name, "%test%"))
    .orderBy(asc(teamsSummaryView.avg_proving_time))

  const teams = await db.query.teams.findMany()

  await queryClient.prefetchQuery({
    queryKey: ["blocks", DEFAULT_PAGE_STATE],
    queryFn: () => fetchBlocksPaginated(DEFAULT_PAGE_STATE),
  })

  const demoZkVmSummary = [
    {
      label: "zkVMs",
      value: "12",
      icon: <ShieldCheck />,
    },
    {
      label: "ISAs",
      value: "5",
      icon: <Instructions />,
    },
    {
      label: "0000",
      value: 0,
    },
  ]

  return (
    <div className="flex flex-1 flex-col items-center gap-20 px-20 md:w-[calc(100vw_-_var(--sidebar-width))]">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div id="latency-kpi" className="w-full">
          <LineChartCard title="latency" />
        </div>
        <div id="cost-kpi" className="w-full">
          <LineChartCard title="cost" />
        </div>
      </div>

      <Card className="w-full bg-white/10 dark:bg-black/10">
        <CardHeader className="space-y-3">
          <CardTitle className="text-2xl">zkVMs</CardTitle>
          <div className="flex justify-around gap-8 py-4">
            {demoZkVmSummary.map(({ label, value, icon }) => (
              <div
                key={label}
                className="flex flex-1 flex-col items-center gap-2"
              >
                <div className="flex items-center gap-1">
                  <div className="flex items-center gap-2 whitespace-nowrap text-4xl text-primary">
                    {icon ? icon : null}
                  </div>
                  <div className="whitespace-nowrap text-4xl font-bold uppercase text-primary">
                    {value}
                  </div>
                </div>
                <div className="whitespace-nowrap text-sm font-bold uppercase text-body">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </CardHeader>

        <ZkvmAccordion />
      </Card>

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
        <div className="grid gap-8 md:grid-cols-[repeat(auto-fill,minmax(24rem,1fr))]">
          {teamsSummary &&
            teamsSummary.map(
              ({
                team_id,
                logo_url,
                team_name,
                avg_cost_per_proof,
                avg_proving_time,
              }) => {
                const isNewTeam = !avg_cost_per_proof || !avg_proving_time
                return (
                  <Card className="flex flex-1 flex-col gap-4" key={team_id}>
                    <div className="relative mx-auto flex h-20 w-full max-w-56 justify-center">
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
                          "absolute inset-0 inline-block min-w-[100px] truncate text-center text-3xl",
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
                            href={`/prover/${team_id}`}
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
