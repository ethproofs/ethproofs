"use client"

import type { RtpCohortCompositionData, RtpWeekEntry } from "@/lib/types"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { cn } from "@/lib/utils"

function formatWeekLabel(week: string): string {
  const date = new Date(week)
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

interface WeekSegmentProps {
  entry: RtpWeekEntry
}

function WeekSegment({ entry }: WeekSegmentProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            "flex-1 cursor-default",
            entry.isEligible ? "bg-primary" : "bg-muted"
          )}
        />
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="min-w-36 rounded-lg border bg-card p-3 shadow-xl"
      >
        <div className="mb-2 flex items-center gap-2">
          <div
            className={cn(
              "size-2.5 rounded-sm",
              entry.isEligible ? "bg-primary" : "bg-muted-foreground"
            )}
          />
          <p className="text-sm font-semibold">{formatWeekLabel(entry.week)}</p>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-muted-foreground">status</span>
          <span
            className={cn(
              "text-xs font-medium",
              entry.isEligible ? "text-primary" : "text-muted-foreground"
            )}
          >
            {entry.isEligible ? "\u2713 eligible" : "not eligible"}
          </span>
        </div>
      </TooltipContent>
    </Tooltip>
  )
}

interface RtpCohortCompositionProps {
  data: RtpCohortCompositionData
}

export function RtpCohortComposition({ data }: RtpCohortCompositionProps) {
  return (
    <Card className="flex h-full min-h-80 flex-col">
      <CardHeader className="space-y-1.5">
        <CardTitle className="text-lg">
          evaluated vs. eligible provers
        </CardTitle>
        <CardDescription>
          weekly eligibility for all evaluated 1:1 multi-GPU provers
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1 rounded-lg bg-muted/50 px-3 py-2">
            <span className="text-xs text-muted-foreground">evaluated</span>
            <span className="font-mono text-lg font-semibold">
              {data.members.length} provers
            </span>
          </div>
          <div className="flex flex-col gap-1 rounded-lg bg-muted/50 px-3 py-2">
            <span className="text-xs text-muted-foreground">eligible</span>
            <span
              className={cn(
                "font-mono text-lg font-semibold",
                data.currentEligibleCount > 0
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              {data.currentEligibleCount} provers
            </span>
          </div>
        </div>

        {data.members.length === 0 ? (
          <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
            no provers evaluated this week
          </div>
        ) : (
          <TooltipProvider delayDuration={100}>
            <div className="flex flex-1 flex-col gap-2">
              {data.members.map((member) => {
                return (
                  <div
                    key={member.clusterName}
                    className="flex items-center gap-3"
                  >
                    <div className="flex w-28 items-center gap-2 truncate">
                      <span
                        className="truncate text-xs"
                        title={member.clusterName}
                      >
                        {member.clusterName}
                      </span>
                    </div>
                    <div className="flex flex-1 items-center gap-2">
                      <div className="flex h-5 flex-1 gap-0.5 overflow-hidden rounded-sm bg-card">
                        {member.weeklyTimeline.map((entry) => (
                          <WeekSegment key={entry.week} entry={entry} />
                        ))}
                      </div>
                      <span className="w-10 text-right text-xs text-muted-foreground">
                        {member.eligibilityRate}%
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </TooltipProvider>
        )}
      </CardContent>

      <CardFooter className="flex-wrap justify-between gap-x-4 gap-y-4 border-t pt-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="size-2 rounded-full bg-primary" />
            <span>eligible</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="size-2 rounded-full bg-muted" />
            <span>not eligible</span>
          </div>
        </div>
        <span>sorted by weeks eligible</span>
        <div className="min-h-14">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-placeholder">Key insight:</span>{" "}
            Each segment is one weekly snapshot. Green means the prover met
            eligibility thresholds that week. Gaps reveal weeks where
            performance or liveness dropped below requirements.
          </p>
        </div>
      </CardFooter>
    </Card>
  )
}
