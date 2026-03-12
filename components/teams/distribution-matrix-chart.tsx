"use client"

import { useQuery } from "@tanstack/react-query"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

import type { TeamContribution } from "@/lib/api/teams-metrics"
import { formatNumber } from "@/lib/number"

function DepthDots({ depth }: { depth: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: depth }, (_, i) => (
        <span key={i} className="text-muted-foreground">
          *
        </span>
      ))}
    </div>
  )
}

export function DistributionMatrixChart() {
  const { data: teams, isLoading } = useQuery<TeamContribution[]>({
    queryKey: ["teams-distribution"],
    queryFn: async () => {
      const response = await fetch("/api/teams/distribution")
      return response.json()
    },
  })

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="text-base">distribution matrix</CardTitle>
        <CardDescription>
          who does what — vertical integration vs. specialization
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        {isLoading ? (
          <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
            loading chart data...
          </div>
        ) : teams?.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
            no data available
          </div>
        ) : (
          <div className="space-y-0">
            {(teams ?? []).map((team) => (
              <div
                key={team.teamId}
                className="flex items-center gap-4 border-b border-border/40 py-1 last:border-b-0"
              >
                <div className="w-32 shrink-0 truncate text-xs">
                  {team.teamName}
                </div>
                <div className="flex w-12 justify-center">
                  {team.hasZkvm && (
                    <span className="inline-block size-2.5 rounded-full bg-chart-2" />
                  )}
                </div>
                <div className="flex w-12 justify-center">
                  {team.hasGuest && (
                    <span className="inline-block size-2.5 rounded-full bg-chart-9" />
                  )}
                </div>
                <div className="flex w-12 justify-center">
                  {team.hasProver && (
                    <span className="inline-block size-2.5 rounded-full bg-chart-12" />
                  )}
                </div>
                <div className="ml-auto">
                  <DepthDots depth={team.depth} />
                </div>
              </div>
            ))}
          </div>
        )}
        {teams && (
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xs text-muted-foreground">
                zkVM maintainers
              </div>
              <div className="text-xl font-semibold">
                {formatNumber(teams.filter((team) => team.hasZkvm).length)}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">
                guest maintainers
              </div>
              <div className="text-xl font-semibold">
                {formatNumber(teams.filter((team) => team.hasGuest).length)}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">
                prover operators
              </div>
              <div className="text-xl font-semibold">
                {formatNumber(teams.filter((team) => team.hasProver).length)}
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex-col items-start gap-y-4 border-t pt-6 text-xs text-muted-foreground">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-chart-2" />
            <span>zkVM maintainer</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-chart-9" />
            <span>guest maintainer</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-chart-12" />
            <span>prover operator</span>
          </div>
        </div>
        <div className="min-h-10">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-placeholder">Key insight:</span>{" "}
            Teams with 3 dots are vertically integrated. Teams with 1 dot are
            specialists. A healthy ecosystem has both.
          </p>
        </div>
      </CardFooter>
    </Card>
  )
}
