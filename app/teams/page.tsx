import { asc, notIlike } from "drizzle-orm"
import type { Metadata } from "next"

import { metrics } from "@/components/Metrics"
import Null from "@/components/Null"
import TeamLogo from "@/components/TeamLogo"
import { ButtonLink } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

import { cn } from "@/lib/utils"

import { AVERAGE_LABEL } from "@/lib/constants"

import { db } from "@/db"
import { teamsSummary as teamsSummaryView } from "@/db/schema"
import { getMetadata } from "@/lib/metadata"
import { formatUsd } from "@/lib/number"
import { prettyMs } from "@/lib/time"

export const metadata: Metadata = getMetadata()

export default async function TeamsPage() {
  const teamsSummary = await db
    .select()
    .from(teamsSummaryView)
    // hide test teams from the provers list
    .where(notIlike(teamsSummaryView.team_name, "%test%"))
    .orderBy(asc(teamsSummaryView.avg_proving_time))

  return (
    <div className="w-full max-w-screen-xl px-6 sm:px-8 md:px-12 lg:w-[calc(100vw_-_var(--sidebar-width))] lg:px-16 xl:px-20">
      <div className="absolute inset-x-0 top-16 space-y-12 text-center font-mono font-semibold">
        <h1
          className="text-3xl"
          style={{
            textShadow: `
              0 0 3rem hsla(var(--background-modal)),
              0 0 2rem hsla(var(--background-modal)),
              0 0 1rem hsla(var(--background-modal)),
              0 0 1rem hsla(var(--background-modal))`,
          }}
        >
          teams
        </h1>
        <div>All the teams with proving machines</div>
      </div>
      <div className="md://grid-cols-[repeat(auto-fill,minmax(24rem,1fr))] mx-auto grid w-full gap-y-12 md:grid-cols-[repeat(2,_auto)] md:gap-x-12 xl:gap-x-32">
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
                      className={cn("object-center", !logo_url && "opacity-50")}
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
    </div>
  )
}
