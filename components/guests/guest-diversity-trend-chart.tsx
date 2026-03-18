"use client"

import { useMemo, useState } from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import type { GuestDiversityPoint } from "@/lib/types"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const CHART_COLORS = [
  "hsl(var(--chart-2))",
  "hsl(var(--chart-9))",
  "hsl(var(--chart-12))",
  "hsl(var(--chart-14))",
  "hsl(var(--chart-11))",
  "hsl(var(--chart-15))",
  "hsl(var(--chart-8))",
] as const

const WARNING_THRESHOLD = 50
const CRITICAL_THRESHOLD = 75

interface PivotedRow {
  week: string
  [guestName: string]: number | string
}

function pivotData(points: GuestDiversityPoint[]): {
  rows: PivotedRow[]
  guestNames: string[]
} {
  const guestTotals = new Map<string, number>()
  const weekCounts = new Map<string, Record<string, number>>()

  for (const point of points) {
    guestTotals.set(
      point.guestName,
      (guestTotals.get(point.guestName) ?? 0) + point.proofCount
    )
    const existing = weekCounts.get(point.week) ?? {}
    existing[point.guestName] =
      (existing[point.guestName] ?? 0) + point.proofCount
    weekCounts.set(point.week, existing)
  }

  const guestNames = Array.from(guestTotals.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => name)

  const rows: PivotedRow[] = Array.from(weekCounts.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, counts]) => {
      const weekTotal = Object.values(counts).reduce((s, c) => s + c, 0)
      const fractions: Record<string, number> = {}
      for (const name of guestNames) {
        fractions[name] = weekTotal > 0 ? (counts[name] ?? 0) / weekTotal : 0
      }
      return { week, ...fractions }
    })

  return { rows, guestNames }
}

function formatWeekTick(value: string): string {
  const date = new Date(value)
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  })
}

function getMaxShare(row: PivotedRow, guestNames: string[]): number {
  let max = 0
  for (const name of guestNames) {
    const val = Number(row[name]) || 0
    if (val > max) max = val
  }
  return max
}

function computeTrendDirection(
  rows: PivotedRow[],
  guestNames: string[]
): "diversifying" | "concentrating" | "stable" {
  if (rows.length < 4 || guestNames.length === 0) return "stable"

  const lastRow = rows[rows.length - 1]
  const currentMax = getMaxShare(lastRow, guestNames) * 100

  const recent = rows.slice(-4)
  const earlier = rows.slice(0, 4)
  const recentAvg =
    recent.reduce((s, r) => s + getMaxShare(r, guestNames), 0) / recent.length
  const earlierAvg =
    earlier.reduce((s, r) => s + getMaxShare(r, guestNames), 0) / earlier.length
  const diff = (recentAvg - earlierAvg) * 100

  if (currentMax >= CRITICAL_THRESHOLD) return "concentrating"
  if (currentMax >= WARNING_THRESHOLD) return "stable"
  if (diff < -2) return "diversifying"
  if (diff > 2) return "concentrating"
  return "stable"
}

function getLatestDominant(
  rows: PivotedRow[],
  guestNames: string[]
): { name: string; share: number } {
  if (rows.length === 0 || guestNames.length === 0)
    return { name: "", share: 0 }
  const lastRow = rows[rows.length - 1]
  let maxName = guestNames[0]
  let maxVal = 0
  for (const name of guestNames) {
    const val = Number(lastRow[name]) || 0
    if (val > maxVal) {
      maxVal = val
      maxName = name
    }
  }
  return { name: maxName, share: maxVal * 100 }
}

interface GuestDiversityTrendChartProps {
  data: GuestDiversityPoint[]
}

export function GuestDiversityTrendChart({
  data,
}: GuestDiversityTrendChartProps) {
  const { rows, guestNames } = useMemo(() => pivotData(data), [data])
  const [hiddenAreas, setHiddenAreas] = useState<Set<string>>(new Set())

  const { name: dominantGuest, share: latestDominantShare } = useMemo(
    () => getLatestDominant(rows, guestNames),
    [rows, guestNames]
  )
  const trend = useMemo(
    () => computeTrendDirection(rows, guestNames),
    [rows, guestNames]
  )

  const trendConfig = {
    diversifying: {
      label: "diversifying",
      icon: "\u2191",
      className: "border-success/30 text-success",
    },
    concentrating: {
      label: "concentrating",
      icon: "\u2193",
      className: "border-destructive/30 text-destructive",
    },
    stable: {
      label: "stable",
      icon: "\u2194",
      className: "border-warning/30 text-warning",
    },
  }

  const handleLegendClick = (dataKey: string) => {
    setHiddenAreas((prev) => {
      const next = new Set(prev)
      if (next.has(dataKey)) {
        next.delete(dataKey)
      } else {
        next.add(dataKey)
      }
      return next
    })
  }

  return (
    <Card className="flex h-full min-h-80 flex-col">
      <CardHeader>
        <CardTitle className="text-lg">guest diversity, trend</CardTitle>
        <CardDescription>
          guest program share of proofs — tracking concentration trends
        </CardDescription>
        <div className="mt-2 flex items-center gap-3">
          <span className="text-xs text-muted-foreground">trend:</span>
          <Badge variant="outline" className={trendConfig[trend].className}>
            {trendConfig[trend].icon} {trendConfig[trend].label}
          </Badge>
          {dominantGuest && (
            <>
              <span className="text-xs text-muted-foreground">
                {dominantGuest} now:
              </span>
              <span className="text-sm font-semibold">
                {latestDominantShare.toFixed(1)}%
              </span>
            </>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        {data.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
            no trend data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={380}>
            <AreaChart
              data={rows}
              margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="week"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={40}
                fontSize={11}
                tickFormatter={formatWeekTick}
              />
              <YAxis
                domain={[0, 1]}
                tickLine={false}
                axisLine={false}
                fontSize={11}
                tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`}
                width={40}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "calc(var(--radius) - 2px)",
                  color: "hsl(var(--foreground))",
                  fontSize: 12,
                  padding: "8px 12px",
                }}
                labelFormatter={formatWeekTick}
                formatter={(value: number) => [`${(value * 100).toFixed(1)}%`]}
                itemSorter={(item) => -(Number(item.value) ?? 0)}
              />
              <Legend
                payload={guestNames.map((name, index) => ({
                  value: name,
                  type: "line",
                  color: CHART_COLORS[index % CHART_COLORS.length],
                  dataKey: name,
                }))}
                onClick={(e) => {
                  if (typeof e.dataKey === "string") {
                    handleLegendClick(e.dataKey)
                  }
                }}
                wrapperStyle={{
                  cursor: "pointer",
                  fontSize: 12,
                  paddingTop: 16,
                }}
              />
              {[...guestNames].reverse().map((name) => {
                const colorIndex = guestNames.indexOf(name)
                return (
                  <Area
                    key={name}
                    type="monotone"
                    dataKey={name}
                    stackId="1"
                    fill={CHART_COLORS[colorIndex % CHART_COLORS.length]}
                    stroke={CHART_COLORS[colorIndex % CHART_COLORS.length]}
                    fillOpacity={0.6}
                    hide={hiddenAreas.has(name)}
                  />
                )
              })}
              <ReferenceLine
                y={WARNING_THRESHOLD / 100}
                stroke="hsl(var(--warning))"
                strokeDasharray="6 4"
                strokeWidth={1.5}
              />
              <ReferenceLine
                y={CRITICAL_THRESHOLD / 100}
                stroke="hsl(var(--destructive))"
                strokeDasharray="6 4"
                strokeWidth={1.5}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>

      <CardFooter className="flex-col items-start gap-y-4 border-t pt-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <svg width="24" height="2">
              <line
                x1="0"
                y1="1"
                x2="24"
                y2="1"
                stroke="hsl(var(--warning))"
                strokeWidth="2"
                strokeDasharray="4 3"
              />
            </svg>
            <span>{WARNING_THRESHOLD}% warning</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg width="24" height="2">
              <line
                x1="0"
                y1="1"
                x2="24"
                y2="1"
                stroke="hsl(var(--destructive))"
                strokeWidth="2"
                strokeDasharray="4 3"
              />
            </svg>
            <span>{CRITICAL_THRESHOLD}% critical</span>
          </div>
        </div>
        <div className="min-h-14">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-placeholder">Key insight:</span> A
            healthy ecosystem shows converging bands. If the dominant
            guest&apos;s area shrinks while others grow, we&apos;re building
            defense-in-depth. Trend is determined by comparing the largest
            guest&apos;s share over the first vs last 4 weeks — above{" "}
            {CRITICAL_THRESHOLD}% is always concentrating.
          </p>
        </div>
      </CardFooter>
    </Card>
  )
}
