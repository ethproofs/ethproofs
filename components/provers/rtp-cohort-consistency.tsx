"use client"

import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"

import type {
  RtpCohortConsistencyData,
  RtpCohortConsistencyMember,
} from "@/lib/types"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { cn } from "@/lib/utils"

interface HoveredProverInfo {
  name: string
  teamName: string
  weeksIncluded: number
  totalWeeks: number
  trackedWeeks: number
  inclusionRate: number
  isCurrentlyIncluded: boolean
  currentStreak: number
}

function computeCurrentStreak(member: RtpCohortConsistencyMember): number {
  let streak = 0
  for (let i = member.weeklyTimeline.length - 1; i >= 0; i--) {
    if (member.weeklyTimeline[i].isEligible) streak++
    else break
  }
  return streak
}

function toHoveredInfo(member: RtpCohortConsistencyMember): HoveredProverInfo {
  return {
    name: member.clusterName,
    teamName: member.teamName,
    weeksIncluded: member.weeksIncluded,
    totalWeeks: member.totalWeeks,
    trackedWeeks: member.trackedWeeks,
    inclusionRate: member.inclusionRate,
    isCurrentlyIncluded: member.isCurrentlyIncluded,
    currentStreak: computeCurrentStreak(member),
  }
}

const CONSISTENCY_RANGE_DAYS = 364

export function RtpCohortConsistency() {
  const { data, isLoading } = useQuery<RtpCohortConsistencyData>({
    queryKey: ["rtp-cohort-consistency"],
    queryFn: async () => {
      const response = await fetch(
        `/api/provers/consistency?days=${CONSISTENCY_RANGE_DAYS}`
      )
      return response.json()
    },
  })
  const [hoveredProver, setHoveredProver] = useState<HoveredProverInfo | null>(
    null
  )

  const members = useMemo(() => data?.members ?? [], [data])

  const timeAxisLabels = useMemo(() => {
    const firstMember = members[0]
    if (!firstMember || firstMember.weeklyTimeline.length === 0) return []
    const len = firstMember.weeklyTimeline.length
    return [
      { label: `${len}w ago`, position: 0 },
      { label: `${Math.round(len / 2)}w ago`, position: 50 },
      { label: "now", position: 100 },
    ]
  }, [members])

  return (
    <Card className="flex h-full min-h-80 flex-col">
      <CardHeader>
        <CardTitle className="text-lg">RTP cohort consistency</CardTitle>
        <CardDescription>
          52-week inclusion history — rewarding sustained excellence
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-2">
        {isLoading ? (
          <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
            loading chart data...
          </div>
        ) : (
          <>
            <div className="relative mb-1 ml-32 mr-12 h-4">
              {timeAxisLabels.map((item) => (
                <span
                  key={item.label}
                  className="absolute text-xs text-muted-foreground"
                  style={{
                    left: `${item.position}%`,
                    transform:
                      item.position === 100
                        ? "translateX(-100%)"
                        : item.position === 50
                          ? "translateX(-50%)"
                          : undefined,
                  }}
                >
                  {item.label}
                </span>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              {members.map((member) => {
                const isHovered = hoveredProver?.name === member.clusterName
                return (
                  <div
                    key={member.clusterName}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1 transition-colors hover:bg-muted/50"
                    onMouseEnter={() => setHoveredProver(toHoveredInfo(member))}
                    onMouseLeave={() => setHoveredProver(null)}
                  >
                    <div className="w-28 shrink-0">
                      <p
                        className="truncate text-xs font-medium"
                        title={member.clusterName}
                      >
                        {member.clusterName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {member.teamName}
                      </p>
                    </div>

                    <div className="flex h-6 flex-1 gap-px overflow-hidden rounded-sm">
                      {member.weeklyTimeline.map((entry, i) => (
                        <div
                          key={entry.week}
                          className={cn(
                            "flex-1 transition-opacity",
                            !entry.hasData
                              ? "bg-muted/50"
                              : entry.isEligible
                                ? "bg-success"
                                : "bg-muted",
                            isHovered ? "opacity-100" : "opacity-85"
                          )}
                          style={{
                            borderRadius:
                              i === 0
                                ? "2px 0 0 2px"
                                : i === member.weeklyTimeline.length - 1
                                  ? "0 2px 2px 0"
                                  : undefined,
                          }}
                        />
                      ))}
                    </div>

                    <div className="flex shrink-0 items-center gap-3 pl-2">
                      <span
                        className={cn(
                          "w-10 text-right font-mono text-xs",
                          member.inclusionRate >= 90
                            ? "text-success"
                            : "text-muted-foreground"
                        )}
                      >
                        {member.inclusionRate}%
                      </span>
                      <span
                        className={cn(
                          "rounded px-1.5 py-0.5 text-xs",
                          member.isCurrentlyIncluded
                            ? "bg-success/20 text-success"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {member.isCurrentlyIncluded ? "●" : "○"}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            {hoveredProver && (
              <div className="mt-4 rounded-lg border border-border p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-semibold">{hoveredProver.name}</p>
                  <span
                    className={cn(
                      "rounded px-1.5 py-0.5 text-xs",
                      hoveredProver.isCurrentlyIncluded
                        ? "bg-success/20 text-success"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {hoveredProver.isCurrentlyIncluded
                      ? "● included"
                      : "○ not included"}
                  </span>
                </div>
                <p className="mb-3 text-xs text-muted-foreground">
                  {hoveredProver.teamName}
                </p>
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">
                      weeks included ({hoveredProver.trackedWeeks}w tracked)
                    </span>
                    <span className="font-mono text-xs">
                      {hoveredProver.weeksIncluded}/{hoveredProver.trackedWeeks}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">
                      inclusion rate
                    </span>
                    <span
                      className={cn(
                        "font-mono text-xs font-semibold",
                        hoveredProver.inclusionRate >= 90
                          ? "text-success"
                          : hoveredProver.inclusionRate >= 70
                            ? "text-muted-foreground"
                            : "text-muted-foreground/70"
                      )}
                    >
                      {hoveredProver.inclusionRate}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">
                      current streak
                    </span>
                    <span className="font-mono text-xs">
                      {hoveredProver.currentStreak} weeks
                    </span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>

      <CardFooter className="flex-col items-start gap-y-4 border-t pt-6 text-xs text-muted-foreground">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="size-2 rounded-lg bg-success" />
              <span>included in RTP</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-2 rounded-lg bg-muted" />
              <span>not included</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-2 rounded-lg bg-muted/50" />
              <span>no data</span>
            </div>
          </div>
          <span>sorted by consistency (most → least)</span>
        </div>
        <div className="min-h-10">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-placeholder">Key insight:</span>{" "}
            Solid green bars indicate consistent RTP inclusion. Gaps reveal
            weeks where one or more criteria were not met. New provers build
            track record over time.
          </p>
        </div>
      </CardFooter>
    </Card>
  )
}
