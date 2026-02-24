"use client"

import { useMemo, useState } from "react"

import type { RtpCohortCompositionData, RtpWeekEntry } from "@/lib/types"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { cn } from "@/lib/utils"

const RANGE_OPTIONS = [
  { label: "7d", value: 7 },
  { label: "30d", value: 30 },
  { label: "90d", value: 90 },
] as const

type RangeValue = (typeof RANGE_OPTIONS)[number]["value"]

interface MonthLabel {
  label: string
  offsetPercent: number
}

function extractMonthLabels(timeline: RtpWeekEntry[]): MonthLabel[] {
  if (timeline.length === 0) return []
  const segmentWidth = 100 / timeline.length
  const seen = new Set<string>()
  const labels: MonthLabel[] = []

  timeline.forEach((entry, index) => {
    const date = new Date(entry.week)
    const monthKey = `${date.getFullYear()}-${date.getMonth()}`
    if (!seen.has(monthKey)) {
      seen.add(monthKey)
      labels.push({
        label: date
          .toLocaleDateString("en-US", { month: "short" })
          .toLowerCase(),
        offsetPercent: index * segmentWidth,
      })
    }
  })

  return labels
}

interface RtpCohortCompositionProps {
  dataByRange: Record<number, RtpCohortCompositionData>
}

export function RtpCohortComposition({
  dataByRange,
}: RtpCohortCompositionProps) {
  const [range, setRange] = useState<RangeValue>(90)
  const filtered = dataByRange[range] ?? dataByRange[90]

  const monthLabels = useMemo(() => {
    const firstMember = filtered.members[0]
    if (!firstMember) return []
    return extractMonthLabels(firstMember.weeklyTimeline)
  }, [filtered.members])

  return (
    <Card className="flex h-full min-h-80 flex-col">
      <CardHeader className="flex-row flex-wrap items-start justify-between gap-2 space-y-0">
        <div className="space-y-1.5">
          <CardTitle className="text-lg">RTP cohort composition</CardTitle>
          <CardDescription>
            who&apos;s been in the cohort and for how long
          </CardDescription>
        </div>
        <div className="flex gap-1 rounded-lg bg-muted p-1">
          {RANGE_OPTIONS.map((option) => (
            <Button
              key={option.value}
              onClick={() => setRange(option.value)}
              size="sm"
              variant="ghost"
              className={cn(
                "h-7 px-2 text-xs",
                range === option.value &&
                  "bg-background text-foreground shadow-sm"
              )}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col gap-1 rounded-lg bg-muted/50 px-3 py-2">
            <span className="text-xs text-muted-foreground">
              current cohort
            </span>
            <span className="font-mono text-lg font-semibold text-primary">
              {filtered.currentCohortSize} provers
            </span>
          </div>
          <div className="flex flex-col gap-1 rounded-lg bg-muted/50 px-3 py-2">
            <span className="text-xs text-muted-foreground">avg tenure</span>
            <span className="font-mono text-lg font-semibold">
              {filtered.avgTenureWeeks} weeks
            </span>
          </div>
          <div className="flex flex-col gap-1 rounded-lg bg-muted/50 px-3 py-2">
            <span className="text-xs text-muted-foreground">
              tracked period
            </span>
            <span className="font-mono text-lg font-semibold">
              {filtered.trackedPeriodWeeks} weeks
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-1">
          <div className="relative mb-1 ml-28 mr-10 h-4 pl-3">
            {monthLabels.map((m) => (
              <span
                key={`${m.label}-${m.offsetPercent}`}
                className="absolute text-xs text-muted-foreground"
                style={{ left: `calc(${m.offsetPercent}% + 12px)` }}
              >
                {m.label}
              </span>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            {filtered.members.map((member) => (
              <div key={member.clusterName} className="flex items-center gap-3">
                <div className="flex w-28 items-center gap-2 truncate">
                  <div
                    className={cn(
                      "size-2 shrink-0 rounded-full",
                      member.isCurrentlyEligible
                        ? "bg-primary"
                        : "bg-muted-foreground"
                    )}
                  />
                  <span className="truncate text-xs" title={member.clusterName}>
                    {member.clusterName}
                  </span>
                </div>
                <div className="flex flex-1 items-center gap-2">
                  <div className="flex h-5 flex-1 gap-0.5 overflow-hidden rounded-sm bg-card">
                    {member.weeklyTimeline.map((entry) => (
                      <div
                        key={entry.week}
                        className={cn(
                          "flex-1",
                          entry.isEligible ? "bg-primary" : "bg-muted"
                        )}
                      />
                    ))}
                  </div>
                  <span className="w-10 text-right text-xs text-muted-foreground">
                    {member.cohortPercentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex-wrap justify-between gap-x-4 gap-y-2 border-t pt-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="size-2 rounded-full bg-primary" />
            <span>in RTP cohort</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="size-2 rounded-full bg-muted" />
            <span>not in cohort</span>
          </div>
        </div>
        <span>sorted by weeks in cohort</span>
      </CardFooter>
    </Card>
  )
}
