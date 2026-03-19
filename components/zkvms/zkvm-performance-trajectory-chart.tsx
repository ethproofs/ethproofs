"use client"

import { useMemo, useState } from "react"
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import type { ZkvmPerformancePoint } from "@/lib/types"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { RTP_PERFORMANCE_TIME_THRESHOLD_MS } from "@/lib/constants"

import { prettyMs } from "@/lib/time"

const CHART_COLORS = [
  "hsl(var(--chart-2))",
  "hsl(var(--chart-9))",
  "hsl(var(--chart-12))",
  "hsl(var(--chart-14))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-15))",
  "hsl(var(--chart-6))",
  "hsl(var(--chart-11))",
  "hsl(var(--chart-8))",
] as const

const RTP_THRESHOLD_SECONDS = RTP_PERFORMANCE_TIME_THRESHOLD_MS / 1000

interface PivotedRow {
  week: string
  [zkvmName: string]: number | string
}

function pivotData(points: ZkvmPerformancePoint[]): {
  rows: PivotedRow[]
  zkvmNames: string[]
} {
  const zkvmNameSet = new Set<string>()
  const weekMap = new Map<string, Record<string, number>>()

  for (const point of points) {
    zkvmNameSet.add(point.zkvmName)
    const existing = weekMap.get(point.week) ?? {}
    existing[point.zkvmName] = point.avgProvingTimeMs / 1000
    weekMap.set(point.week, existing)
  }

  const zkvmNames = Array.from(zkvmNameSet).sort()
  const rows: PivotedRow[] = Array.from(weekMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, scores]) => ({
      week,
      ...scores,
    }))

  return { rows, zkvmNames }
}

function formatWeekTick(value: string): string {
  const date = new Date(value)
  return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" })
}

interface ZkvmPerformanceTrajectoryChartProps {
  data: ZkvmPerformancePoint[]
}

export function ZkvmPerformanceTrajectoryChart({
  data,
}: ZkvmPerformanceTrajectoryChartProps) {
  const { rows, zkvmNames } = useMemo(() => pivotData(data), [data])
  const [hiddenLines, setHiddenLines] = useState<Set<string>>(new Set())

  const handleLegendClick = (dataKey: string) => {
    setHiddenLines((prev) => {
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
        <CardTitle className="text-lg">performance trajectory</CardTitle>
        <CardDescription>
          average proving time by zkVM over time
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1">
        {data.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
            no performance data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={430}>
            <LineChart
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
                reversed
                tickLine={false}
                axisLine={false}
                fontSize={11}
                tickFormatter={(v: number) => prettyMs(v * 1000)}
                width={50}
              />
              <ReferenceLine
                y={RTP_THRESHOLD_SECONDS}
                stroke="hsl(var(--level-best))"
                strokeDasharray="6 4"
                strokeWidth={1.5}
                strokeOpacity={0.6}
                label={{
                  value: `${RTP_THRESHOLD_SECONDS}s RTP threshold`,
                  position: "insideTopRight",
                  fill: "hsl(var(--muted-foreground))",
                  fontSize: 10,
                }}
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
                formatter={(value: number, name: string) => [
                  prettyMs(value * 1000),
                  name,
                ]}
                itemSorter={(item) => Number(item.value ?? 0)}
              />
              <Legend
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
              {zkvmNames.map((name, index) => (
                <Line
                  key={name}
                  type="monotone"
                  dataKey={name}
                  stroke={CHART_COLORS[index % CHART_COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                  hide={hiddenLines.has(name)}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>

      <CardFooter className="flex-wrap justify-between gap-x-4 gap-y-4 border-t pt-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <p className="text-xs text-muted-foreground">
            click legend items to compare specific zkVMs
          </p>
        </div>
      </CardFooter>
    </Card>
  )
}
