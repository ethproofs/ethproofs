import type { Metadata } from "next"

import { metrics } from "@/components/Metrics"
import Null from "@/components/Null"
import TeamLogo from "@/components/TeamLogo"
import { ButtonLink } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

import { cn } from "@/lib/utils"

import { AVERAGE_LABEL } from "@/lib/constants"

import { getTeamsSummary } from "@/lib/api/stats"
import { getMetadata } from "@/lib/metadata"
import { formatUsd } from "@/lib/number"
import { prettyMs } from "@/lib/time"

export const metadata: Metadata = getMetadata()

export default async function TeamsPage() {
  const teamsSummary = await getTeamsSummary()

  return (
    <>
      <h1 className="text-shadow my-12 px-6 text-center font-mono text-3xl font-semibold md:my-24 md:px-8">
        proving teams
      </h1>

      <div className="mx-auto grid max-w-screen-xl gap-y-12 px-6 md:gap-x-12 md:px-8 lg:grid-cols-[repeat(2,_auto)] xl:gap-x-32">
        {teamsSummary &&
          teamsSummary.map(
            ({
              team_id,
              slug,
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
                        <ButtonLink href={`/teams/${slug}`} variant="outline">
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
    </>
  )
}
