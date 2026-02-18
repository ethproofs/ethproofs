"use client"

import { useMemo, useState } from "react"
import { Cell, Pie, PieChart, ResponsiveContainer, Sector } from "recharts"

import type { RtpCohortPerformanceData } from "@/lib/types"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const RANGE_OPTIONS = [
  { label: "24h", days: 1 },
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
] as const

type RangeDays = (typeof RANGE_OPTIONS)[number]["days"]

interface PerformanceBreakdown {
  name: string
  value: number
  count: number
  color: string
}

interface AggregatedPerformance {
  total: number
  breakdown: PerformanceBreakdown[]
  sub10sRate: number
}

const CATEGORY_COLORS = {
  sub10s: "hsl(var(--level-best))",
  stunned: "hsl(var(--level-middle))",
  paralyzed: "hsl(var(--level-worst))",
  offline: "hsl(var(--muted-foreground))",
} as const

function buildPerformanceBreakdown(
  data: RtpCohortPerformanceData
): AggregatedPerformance {
  const {
    totalBlockSlots,
    sub10sCount,
    stunnedCount,
    paralyzedCount,
    offlineCount,
  } = data
  if (totalBlockSlots === 0) {
    return { total: 0, breakdown: [], sub10sRate: 0 }
  }

  const toPercent = (count: number) =>
    Math.round((count / totalBlockSlots) * 10000) / 100

  return {
    total: totalBlockSlots,
    sub10sRate: toPercent(sub10sCount),
    breakdown: [
      {
        name: "\u226410 secs",
        value: toPercent(sub10sCount),
        count: sub10sCount,
        color: CATEGORY_COLORS.sub10s,
      },
      {
        name: "stunned",
        value: toPercent(stunnedCount),
        count: stunnedCount,
        color: CATEGORY_COLORS.stunned,
      },
      {
        name: "paralyzed",
        value: toPercent(paralyzedCount),
        count: paralyzedCount,
        color: CATEGORY_COLORS.paralyzed,
      },
      {
        name: "offline",
        value: toPercent(offlineCount),
        count: offlineCount,
        color: CATEGORY_COLORS.offline,
      },
    ],
  }
}

function isActiveShapeProps(props: unknown): props is {
  cx: number
  cy: number
  innerRadius: number
  outerRadius: number
  startAngle: number
  endAngle: number
  fill: string
} {
  if (typeof props !== "object" || props === null) return false
  const p = props as Record<string, unknown>
  return (
    typeof p.cx === "number" &&
    typeof p.cy === "number" &&
    typeof p.innerRadius === "number" &&
    typeof p.outerRadius === "number" &&
    typeof p.startAngle === "number" &&
    typeof p.endAngle === "number" &&
    typeof p.fill === "string"
  )
}

function renderActiveShape(props: unknown) {
  if (!isActiveShapeProps(props)) return <></>
  return (
    <Sector
      cx={props.cx}
      cy={props.cy}
      innerRadius={props.innerRadius - 2}
      outerRadius={props.outerRadius + 6}
      startAngle={props.startAngle}
      endAngle={props.endAngle}
      fill={props.fill}
    />
  )
}

interface RtpCohortPerformanceProps {
  dataByRange: Record<number, RtpCohortPerformanceData>
}

export function RtpCohortPerformance({
  dataByRange,
}: RtpCohortPerformanceProps) {
  const [rangeDays, setRangeDays] = useState<RangeDays>(7)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const data = dataByRange[rangeDays] ?? dataByRange[7]
  const performance = useMemo(() => buildPerformanceBreakdown(data), [data])

  return (
    <Card className="flex h-full min-h-80 flex-col">
      <CardHeader className="flex-row flex-wrap items-start justify-between gap-2 space-y-0">
        <div className="space-y-1.5">
          <CardTitle className="text-lg">RTP cohort performance</CardTitle>
          <CardDescription>
            aggregated success rate for the RTP cohort
          </CardDescription>
        </div>
        <div className="flex gap-1 rounded-lg bg-background p-1">
          {RANGE_OPTIONS.map((option) => (
            <Button
              key={option.days}
              onClick={() => setRangeDays(option.days)}
              size="sm"
              variant={rangeDays === option.days ? "secondary" : "ghost"}
              className="h-7 px-2 text-xs"
            >
              {option.label}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4">
        <div className="relative">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={performance.breakdown}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={2}
                dataKey="value"
                activeIndex={activeIndex ?? undefined}
                activeShape={renderActiveShape}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {performance.breakdown.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke="hsl(var(--card))"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold">
              {performance.total.toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground">proofs</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {performance.breakdown.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <div
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs">{item.name}</span>
              </div>
              <span
                className="font-mono text-xs font-semibold"
                style={{ color: item.color }}
              >
                {item.value >= 10
                  ? item.value.toFixed(1)
                  : item.value.toFixed(2)}
                %
              </span>
            </div>
          ))}
        </div>
      </CardContent>

      <CardFooter className="flex-wrap justify-between gap-x-4 gap-y-2 border-t pt-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>current:</span>
          <span className="font-mono font-semibold text-foreground">
            {performance.sub10sRate.toFixed(1)}% sub-10s
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span>target:</span>
          <span className="font-mono text-foreground">{"\u2265"}75%</span>
        </div>
      </CardFooter>
    </Card>
  )
}
