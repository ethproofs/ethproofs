"use client"

import { useMemo } from "react"

import type { RtpCohortCompositionData } from "@/lib/types"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface RtpCohortCompositionProps {
  data: RtpCohortCompositionData
}

export function RtpCohortComposition({ data }: RtpCohortCompositionProps) {
  const currentMembers = useMemo(
    () => data.members.filter((m) => m.isCurrentlyEligible),
    [data.members]
  )

  return (
    <Card className="flex h-full min-h-80 flex-col">
      <CardHeader className="space-y-1.5">
        <CardTitle className="text-lg">cohort composition</CardTitle>
        <CardDescription>
          provers currently in the RTP cohort this week
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1 rounded-lg bg-muted/50 px-3 py-2">
            <span className="text-xs text-muted-foreground">cohort size</span>
            <span className="font-mono text-lg font-semibold text-primary">
              {data.currentCohortSize} provers
            </span>
          </div>
          <div className="flex flex-col gap-1 rounded-lg bg-muted/50 px-3 py-2">
            <span className="text-xs text-muted-foreground">avg tenure</span>
            <span className="font-mono text-lg font-semibold">
              {data.avgTenureWeeks} weeks
            </span>
          </div>
        </div>

        {currentMembers.length === 0 ? (
          <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
            no provers in the RTP cohort this week
          </div>
        ) : (
          <div className="flex flex-1 flex-col gap-2">
            {currentMembers.map((member) => (
              <div key={member.clusterName} className="flex items-center gap-3">
                <div className="flex w-28 items-center gap-2 truncate">
                  <div className="size-2 shrink-0 rounded-full bg-primary" />
                  <span className="truncate text-xs" title={member.clusterName}>
                    {member.clusterName}
                  </span>
                </div>
                <div className="flex flex-1 items-center gap-2">
                  <div className="h-5 flex-1 overflow-hidden rounded-sm bg-muted">
                    <div
                      className="h-full rounded-sm bg-primary"
                      style={{ width: `${member.cohortPercentage}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-xs text-muted-foreground">
                    {member.cohortPercentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex-wrap justify-between gap-x-4 gap-y-4 border-t pt-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="size-2 rounded-full bg-primary" />
            <span>cohort tenure</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="size-2 rounded-full bg-muted" />
            <span>remaining</span>
          </div>
        </div>
        <div className="min-h-14">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-placeholder">Key insight:</span>{" "}
            Bar length shows how long each prover has maintained RTP
            eligibility. Longer bars indicate sustained excellence across weekly
            snapshots.
          </p>
        </div>
      </CardFooter>
    </Card>
  )
}
