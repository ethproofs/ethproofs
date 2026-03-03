"use client"

import { useMemo, useState } from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { useQuery } from "@tanstack/react-query"

import type { ReliabilityDailyStats } from "@/lib/types"

import { Badge } from "@/components/ui/badge"
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
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
] as const

type RangeDays = (typeof RANGE_OPTIONS)[number]["days"]

const MAX_FETCH_DAYS = 90
const TARGET_RATE = 75

const CATEGORY_COLORS = {
  sub10s: "hsl(var(--level-best))",
  stunner: "hsl(var(--level-middle))",
  paralyzer: "hsl(var(--level-worst))",
} as const

function filterByRange(
  data: ReliabilityDailyStats[],
  days: number
): ReliabilityDailyStats[] {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  return data.filter((item) => new Date(item.date) >= cutoff)
}

function computeAggregateRates(data: ReliabilityDailyStats[]) {
  const totalProofs = data.reduce((sum, d) => sum + d.totalCount, 0)
  const totalSub10s = data.reduce((sum, d) => sum + d.sub10sCount, 0)
  const totalStunner = data.reduce((sum, d) => sum + d.stunnerCount, 0)
  const totalParalyzer = data.reduce((sum, d) => sum + d.paralyzerCount, 0)

  return {
    sub10sRate: totalProofs > 0 ? (totalSub10s / totalProofs) * 100 : 0,
    stunnerRate: totalProofs > 0 ? (totalStunner / totalProofs) * 100 : 0,
    paralyzerRate: totalProofs > 0 ? (totalParalyzer / totalProofs) * 100 : 0,
    totalProofs,
  }
}

function formatDateTick(value: string): string {
  const date = new Date(value)
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export function ProvingReliabilityChart() {
  const [rangeDays, setRangeDays] = useState<RangeDays>(30)

  const { data: rawData, isLoading } = useQuery<ReliabilityDailyStats[]>({
    queryKey: ["reliability-daily-stats"],
    queryFn: async () => {
      const response = await fetch(
        `/api/metrics/reliability?days=${MAX_FETCH_DAYS}`
      )
      return response.json()
    },
  })

  const filteredData = useMemo(
    () => (rawData ? filterByRange(rawData, rangeDays) : []),
    [rawData, rangeDays]
  )

  const aggregates = useMemo(
    () => computeAggregateRates(filteredData),
    [filteredData]
  )

  const isAboveTarget = aggregates.sub10sRate >= TARGET_RATE

  return (
    <Card className="flex h-full min-h-80 flex-col">
      <CardHeader className="flex-row flex-wrap items-start justify-between gap-2 space-y-0">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">proving reliability</CardTitle>
            <Badge
              variant="outline"
              className={
                isAboveTarget
                  ? "border-green-500/30 text-green-500"
                  : "border-yellow-500/30 text-yellow-500"
              }
            >
              {aggregates.sub10sRate.toFixed(1)}% sub-10s
            </Badge>
          </div>
          <CardDescription>
            proof completion breakdown by time category
          </CardDescription>
        </div>
        <div className="flex gap-1 rounded-lg bg-muted p-1">
          {RANGE_OPTIONS.map((option) => (
            <Button
              key={option.days}
              onClick={() => setRangeDays(option.days)}
              size="sm"
              variant="ghost"
              className={cn(
                "h-7 px-2 text-xs",
                rangeDays === option.days &&
                  "bg-background text-foreground shadow-sm"
              )}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="rounded-lg bg-muted/50 px-3 py-2">
            <span className="text-xs text-muted-foreground">sub-10s rate</span>
            <p
              className="font-mono text-sm font-semibold"
              style={{ color: CATEGORY_COLORS.sub10s }}
            >
              {aggregates.sub10sRate.toFixed(1)}%
            </p>
          </div>
          <div className="rounded-lg bg-muted/50 px-3 py-2">
            <span className="text-xs text-muted-foreground">stunner rate</span>
            <p
              className="font-mono text-sm font-semibold"
              style={{ color: CATEGORY_COLORS.stunner }}
            >
              {aggregates.stunnerRate.toFixed(1)}%
            </p>
          </div>
          <div className="rounded-lg bg-muted/50 px-3 py-2">
            <span className="text-xs text-muted-foreground">
              paralyzer rate
            </span>
            <p
              className="font-mono text-sm font-semibold"
              style={{ color: CATEGORY_COLORS.paralyzer }}
            >
              {aggregates.paralyzerRate.toFixed(1)}%
            </p>
          </div>
          <div className="rounded-lg bg-muted/50 px-3 py-2">
            <span className="text-xs text-muted-foreground">target</span>
            <p className="font-mono text-sm font-semibold">
              {"\u2265"}
              {TARGET_RATE}%
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
            loading chart data...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart
              data={filteredData}
              margin={{ top: 5, right: 0, left: 0, bottom: 0 }}
              stackOffset="expand"
            >
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={40}
                fontSize={11}
                tickFormatter={formatDateTick}
              />
              <YAxis
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
                labelFormatter={formatDateTick}
                formatter={(
                  _value: number,
                  name: string,
                  item: { payload?: ReliabilityDailyStats }
                ) => {
                  const { payload } = item
                  if (name === "sub10sCount")
                    return [payload?.sub10sRate.toFixed(1) + "%", "sub-10s"]
                  if (name === "stunnerCount")
                    return [payload?.stunnerRate.toFixed(1) + "%", "stunners"]
                  if (name === "paralyzerCount")
                    return [
                      payload?.paralyzerRate.toFixed(1) + "%",
                      "paralyzers",
                    ]
                  return [String(_value), name]
                }}
              />
              <ReferenceLine
                y={0.95}
                stroke="hsl(var(--foreground))"
                strokeDasharray="4 4"
                strokeWidth={1}
                strokeOpacity={0.4}
              />
              <Area
                dataKey="sub10sCount"
                type="monotone"
                stackId="1"
                fill={CATEGORY_COLORS.sub10s}
                stroke={CATEGORY_COLORS.sub10s}
                fillOpacity={0.6}
              />
              <Area
                dataKey="stunnerCount"
                type="monotone"
                stackId="1"
                fill={CATEGORY_COLORS.stunner}
                stroke={CATEGORY_COLORS.stunner}
                fillOpacity={0.6}
              />
              <Area
                dataKey="paralyzerCount"
                type="monotone"
                stackId="1"
                fill={CATEGORY_COLORS.paralyzer}
                stroke={CATEGORY_COLORS.paralyzer}
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>

      <CardFooter className="flex-wrap justify-between gap-x-4 gap-y-4 border-t pt-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div
              className="size-2 rounded-full"
              style={{ backgroundColor: CATEGORY_COLORS.sub10s }}
            />
            <span>sub-10s</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div
              className="size-2 rounded-full"
              style={{ backgroundColor: CATEGORY_COLORS.stunner }}
            />
            <span>stunners</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div
              className="size-2 rounded-full"
              style={{ backgroundColor: CATEGORY_COLORS.paralyzer }}
            />
            <span>paralyzers</span>
          </div>
        </div>
        <span>{aggregates.totalProofs.toLocaleString()} total proofs</span>
        <div className="min-h-14">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-placeholder">Key insight:</span> A
            healthy ecosystem is mostly green (sub-10s), with thin yellow and
            red bands. The 95% threshold is the RTP cohort eligibility bar.
            Growing yellow/red bands indicate emerging issues — investigate gas
            spikes, difficult blocks, or prover problems.
          </p>
        </div>
      </CardFooter>
    </Card>
  )
}
