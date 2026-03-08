"use client"

import { useMemo, useState } from "react"
import {
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { useQuery } from "@tanstack/react-query"

import type { GpuPriceHistoryEntry } from "@/lib/types"

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

import { formatUsd } from "@/lib/number"

const DEFAULT_WEEKS = 32

function computeStats(data: GpuPriceHistoryEntry[]) {
  if (data.length === 0) {
    return { current: 0, avg: 0, low: 0, high: 0 }
  }

  const prices = data.map((d) => d.avgGpuPrice)
  const current = prices[prices.length - 1]
  const avg = prices.reduce((sum, p) => sum + p, 0) / prices.length
  const low = Math.min(...prices)
  const high = Math.max(...prices)

  return { current, avg, low, high }
}

function formatWeekTick(value: string): string {
  const date = new Date(value)
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export function GpuPriceIndexChart() {
  const [showCorrelation, setShowCorrelation] = useState(false)

  const { data: rawData, isLoading } = useQuery<GpuPriceHistoryEntry[]>({
    queryKey: ["gpu-price-history"],
    queryFn: async () => {
      const response = await fetch(
        `/api/metrics/gpu-price?weeks=${DEFAULT_WEEKS}`
      )
      return response.json()
    },
  })

  const chartData = useMemo(() => rawData ?? [], [rawData])
  const stats = useMemo(() => computeStats(chartData), [chartData])
  const lastUpdated = useMemo(() => {
    const lastEntry = chartData[chartData.length - 1]
    if (!lastEntry) return null
    return formatWeekTick(lastEntry.week)
  }, [chartData])

  return (
    <Card className="flex h-full min-h-80 flex-col">
      <CardHeader className="flex-row flex-wrap items-start justify-between gap-2 space-y-0">
        <div className="space-y-1.5">
          <CardTitle className="text-lg">GPU price index</CardTitle>
          <CardDescription>weekly average GPU hourly price</CardDescription>
        </div>
        <div className="flex gap-1 rounded-lg bg-muted p-1">
          {(["price", "price + cost"] as const).map((option) => {
            const isActive =
              option === "price" ? !showCorrelation : showCorrelation
            return (
              <Button
                key={option}
                onClick={() => setShowCorrelation(option === "price + cost")}
                size="sm"
                variant="ghost"
                className={cn(
                  "h-7 px-2 text-xs",
                  isActive && "bg-background text-foreground shadow-sm"
                )}
              >
                {option}
              </Button>
            )
          })}
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="rounded-lg bg-muted/50 px-3 py-2">
            <span className="text-xs text-muted-foreground">current</span>
            <p className="font-mono text-sm font-semibold">
              {formatUsd(stats.current, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
              /hr
            </p>
          </div>
          <div className="rounded-lg bg-muted/50 px-3 py-2">
            <span className="text-xs text-muted-foreground">
              {DEFAULT_WEEKS}w avg
            </span>
            <p className="font-mono text-sm font-semibold">
              {formatUsd(stats.avg, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
              /hr
            </p>
          </div>
          <div className="rounded-lg bg-muted/50 px-3 py-2">
            <span className="text-xs text-muted-foreground">all-time low</span>
            <p className="font-mono text-sm font-semibold">
              {formatUsd(stats.low, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
              /hr
            </p>
          </div>
          <div className="rounded-lg bg-muted/50 px-3 py-2">
            <span className="text-xs text-muted-foreground">all-time high</span>
            <p className="font-mono text-sm font-semibold">
              {formatUsd(stats.high, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
              /hr
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
            loading chart data...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
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
                dataKey="week"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={40}
                fontSize={11}
                tickFormatter={formatWeekTick}
              />
              <YAxis
                yAxisId="gpu"
                orientation="left"
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
              {showCorrelation && (
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
                labelFormatter={formatWeekTick}
                formatter={(value: number, name: string) => {
                  if (name === "avgGpuPrice")
                    return [
                      formatUsd(value, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }) + "/hr",
                      "GPU price",
                    ]
                  if (name === "avgProofCost")
                    return [formatUsd(value), "proof cost"]
                  return [String(value), name]
                }}
              />
              <Line
                yAxisId="gpu"
                dataKey="avgGpuPrice"
                type="monotone"
                stroke="hsl(var(--chart-3))"
                strokeWidth={2}
                dot={false}
                connectNulls
                name="avgGpuPrice"
              />
              {showCorrelation && (
                <Line
                  yAxisId="cost"
                  dataKey="avgProofCost"
                  type="monotone"
                  stroke="hsl(var(--chart-6))"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                  connectNulls
                  name="avgProofCost"
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </CardContent>

      <CardFooter className="flex-wrap justify-between gap-x-4 gap-y-4 border-t pt-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="size-2 rounded-full bg-[hsl(var(--chart-3))]" />
            <span>GPU price</span>
          </div>
          {showCorrelation && (
            <div className="flex items-center gap-1.5">
              <div className="size-2 rounded-full bg-[hsl(var(--chart-6))]" />
              <span>proof cost</span>
            </div>
          )}
        </div>
        {lastUpdated && <span>Last updated: {lastUpdated}</span>}
        <div className="min-h-14">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-placeholder">
              Why this matters:
            </span>{" "}
            Proving economics depend on GPU rental costs. When GPU prices drop,
            proving becomes cheaper — but software optimizations can outpace
            hardware savings. The gap between the orange and green lines shows
            how much efficiency the ecosystem has gained beyond just cheaper
            GPUs.
          </p>
        </div>
      </CardFooter>
    </Card>
  )
}
