"use client"

import { useMemo, useState } from "react"
import {
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { useQuery } from "@tanstack/react-query"

import type { ProofsDailyStats } from "@/lib/types"

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

import { CHART_RANGES, GAS_LIMIT_INCREASES } from "@/lib/constants"

import { formatUsd } from "@/lib/number"
import { prettyMs } from "@/lib/time"

type MetricView = "latency" | "cost" | "both"

const RANGE_OPTIONS = [
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
] as const

type RangeDays = (typeof RANGE_OPTIONS)[number]["days"]

interface ChartEntry {
  date: string
  avgLatency: number
  avgCost: number
}

function transformDailyStats(data: ProofsDailyStats[]): ChartEntry[] {
  return data.map((item) => ({
    date: item.date,
    avgLatency: item.avg_latency,
    avgCost: item.avg_cost,
  }))
}

function filterByRange(data: ChartEntry[], days: number): ChartEntry[] {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  return data.filter((item) => new Date(item.date) >= cutoff)
}

function formatDateTick(value: string): string {
  const date = new Date(value)
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export function ProvingEfficiencyChart() {
  const [rangeDays, setRangeDays] = useState<RangeDays>(30)
  const [metricView, setMetricView] = useState<MetricView>("both")

  const { data: rawData, isLoading } = useQuery<ProofsDailyStats[]>({
    queryKey: ["proofs-daily-stats-efficiency"],
    queryFn: async () => {
      const response = await fetch(
        `/api/stats/proofs/daily?days=${Math.max(...CHART_RANGES)}`
      )
      return response.json()
    },
  })

  const chartData = useMemo(() => {
    if (!rawData) return []
    return filterByRange(transformDailyStats(rawData), rangeDays)
  }, [rawData, rangeDays])

  const showLatency = metricView === "latency" || metricView === "both"
  const showCost = metricView === "cost" || metricView === "both"

  const visibleGasLimitIncreases = useMemo(() => {
    if (chartData.length === 0) return []
    return GAS_LIMIT_INCREASES.flatMap((event) => {
      const eventTime = new Date(event.date).getTime()
      const matchingPoint = chartData.find(
        (point) => new Date(point.date).getTime() >= eventTime
      )
      if (!matchingPoint) return []
      return [{ ...event, dataDate: matchingPoint.date }]
    })
  }, [chartData])

  const referenceYAxisId = showLatency ? "latency" : "cost"

  return (
    <Card className="flex h-full min-h-80 flex-col">
      <CardHeader className="flex-row flex-wrap items-start justify-between gap-2 space-y-0">
        <div className="space-y-1.5">
          <CardTitle className="text-lg">proving efficiency</CardTitle>
          <CardDescription>
            daily average latency and cost trends
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 rounded-lg bg-muted p-1">
            {(["latency", "cost", "both"] as const).map((view) => (
              <Button
                key={view}
                onClick={() => setMetricView(view)}
                size="sm"
                variant="ghost"
                className={cn(
                  "h-7 px-2 text-xs",
                  metricView === view &&
                    "bg-background text-foreground shadow-sm"
                )}
              >
                {view}
              </Button>
            ))}
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
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4">
        {isLoading ? (
          <div className="flex h-[320px] items-center justify-center text-sm text-muted-foreground">
            loading chart data...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320} className="mt-4">
            <ComposedChart
              data={chartData}
              margin={{ top: 5, right: 0, left: 0, bottom: 0 }}
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
              {showLatency && (
                <YAxis
                  yAxisId="latency"
                  orientation="left"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  tickFormatter={(v: number) => prettyMs(v)}
                  width={40}
                />
              )}
              {showCost && (
                <YAxis
                  yAxisId="cost"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  tickFormatter={(v: number) =>
                    formatUsd(v, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  }
                  width={40}
                />
              )}
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
                formatter={(value: number, name: string) => {
                  if (name === "avgLatency") return [prettyMs(value), "latency"]
                  if (name === "avgCost") return [formatUsd(value), "cost"]
                  return [String(value), name]
                }}
              />
              {visibleGasLimitIncreases.map((event) => (
                <ReferenceArea
                  key={event.date}
                  yAxisId={referenceYAxisId}
                  x1={event.dataDate}
                  fill="hsl(var(--chart-11))"
                  fillOpacity={0.08}
                  stroke="hsl(var(--chart-11))"
                  strokeOpacity={0.3}
                  strokeDasharray="3 3"
                  label={{
                    value: `gas limit: ${event.from / 1_000_000}M → ${event.to / 1_000_000}M`,
                    position: "insideTopLeft",
                    fontSize: 10,
                    fill: "hsl(var(--chart-11))",
                  }}
                />
              ))}
              {showLatency && (
                <ReferenceLine
                  yAxisId="latency"
                  y={10000}
                  stroke="hsl(var(--destructive))"
                  strokeDasharray="4 4"
                  strokeWidth={1}
                  label={{
                    value: "10s target",
                    position: "insideTopRight",
                    fontSize: 10,
                    fill: "hsl(var(--destructive))",
                  }}
                />
              )}
              {showLatency && (
                <Line
                  yAxisId="latency"
                  dataKey="avgLatency"
                  type="monotone"
                  stroke="hsl(var(--chart-3))"
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                  name="avgLatency"
                />
              )}
              {showCost && (
                <Line
                  yAxisId="cost"
                  dataKey="avgCost"
                  type="monotone"
                  stroke="hsl(var(--chart-6))"
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                  name="avgCost"
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </CardContent>

      <CardFooter className="flex-wrap justify-between gap-x-4 gap-y-4 border-t pt-6 text-xs text-muted-foreground">
        <div className="flex flex-wrap items-center gap-4">
          {showLatency && (
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <div className="size-2 rounded-full bg-[hsl(var(--chart-3))]" />
              <span>latency</span>
            </div>
          )}
          {showCost && (
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <div className="size-2 rounded-full bg-[hsl(var(--chart-6))]" />
              <span>cost</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <div className="size-2 rounded-full bg-[hsl(var(--chart-11))]" />
            <span>gas limit increase</span>
          </div>
        </div>
        <div className="min-h-14">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-placeholder">Key insight:</span>{" "}
            Orange line (latency) should trend down toward 10s threshold. Green
            line (cost) should trend down toward $0.01. Blue shaded area shows
            gas limit increases — efficiency improving despite harder blocks is
            the success story.
          </p>
        </div>
      </CardFooter>
    </Card>
  )
}
