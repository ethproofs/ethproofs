"use client"

import { useMemo } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { useQuery } from "@tanstack/react-query"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { RTP_PERFORMANCE_TIME_THRESHOLD_MS } from "@/lib/constants"

import type { BlocksMetricsData } from "@/lib/api/blocks-metrics"
import { formatNumber } from "@/lib/number"
import { prettyMs } from "@/lib/time"

const PHASE_COLORS = {
  queue: "hsl(var(--chart-2))",
  prove: "hsl(var(--chart-9))",
} as const

interface ChartDataPoint {
  blockNumber: number
  label: string
  queue: number
  prove: number
  total: number
  isStunner: boolean
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ payload?: ChartDataPoint }>
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const point = payload[0]?.payload
  if (!point) return null

  return (
    <div className="rounded-md border border-border bg-card px-3 py-2 text-xs shadow-md">
      <p className="mb-1 font-semibold">
        block #{formatNumber(point.blockNumber)}
      </p>
      <div className="space-y-0.5 text-muted-foreground">
        <p>queue: {prettyMs(point.queue)}</p>
        <p>prove: {prettyMs(point.prove)}</p>
        <p className="font-medium text-foreground">
          total: {prettyMs(point.total)}
        </p>
      </div>
    </div>
  )
}

export function ProvingTimeDistributionChart() {
  const { data, isLoading } = useQuery<BlocksMetricsData>({
    queryKey: ["blocks-chart-data"],
    queryFn: async () => {
      const response = await fetch("/api/blocks/metrics?type=charts")
      return response.json()
    },
    staleTime: 60_000,
  })

  const chartData = useMemo<ChartDataPoint[]>(() => {
    if (!data) return []
    return [...data.provingTimeBreakdown].reverse().map((b) => ({
      blockNumber: b.blockNumber,
      label: formatNumber(b.blockNumber),
      queue: b.queueTime,
      prove: b.proveTime,
      total: b.totalTime,
      isStunner: b.isStunner,
    }))
  }, [data])

  return (
    <Card className="flex h-full min-h-80 flex-col">
      <CardHeader>
        <CardTitle className="text-lg">proving time distribution</CardTitle>
        <CardDescription>
          time breakdown per block — identify bottlenecks
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1">
        {isLoading ? (
          <div className="flex h-[400px] items-center justify-center text-sm text-muted-foreground">
            loading chart data...
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-[400px] items-center justify-center text-sm text-muted-foreground">
            no data available
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  tickFormatter={(v: number) => prettyMs(v)}
                />
                <YAxis
                  type="category"
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  fontSize={10}
                  width={60}
                  tick={({ x, y, payload }) => {
                    const point = chartData.find(
                      (d) => d.label === payload.value
                    )
                    const isStunner = point?.isStunner ?? false
                    return (
                      <text
                        x={x}
                        y={y}
                        dy={4}
                        textAnchor="end"
                        fontSize={10}
                        fill={
                          isStunner
                            ? "hsl(var(--warning))"
                            : "hsl(var(--muted-foreground))"
                        }
                        fontWeight={isStunner ? 700 : 400}
                      >
                        {payload.value}
                      </text>
                    )
                  }}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "hsl(var(--muted)/0.1)" }}
                />
                <ReferenceLine
                  x={RTP_PERFORMANCE_TIME_THRESHOLD_MS}
                  stroke="hsl(var(--muted-foreground))"
                  strokeDasharray="6 4"
                  strokeWidth={1.5}
                  label={{
                    value: "10s RTP threshold",
                    position: "insideTopRight",
                    fill: "hsl(var(--muted-foreground))",
                    fontSize: 10,
                  }}
                />
                <Bar
                  dataKey="queue"
                  stackId="a"
                  fill={PHASE_COLORS.queue}
                  radius={0}
                />
                <Bar
                  dataKey="prove"
                  stackId="a"
                  fill={PHASE_COLORS.prove}
                  radius={0}
                />
              </BarChart>
            </ResponsiveContainer>
          </>
        )}
        {data && (
          <div className="mt-8 grid w-full grid-cols-2 gap-4">
            <div className="flex flex-col items-center">
              <span className="text-muted-foreground">avg queue</span>
              <span className="text-sm font-semibold text-foreground">
                {prettyMs(data.avgQueueTime)}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-muted-foreground">avg prove</span>
              <span className="text-sm font-semibold text-foreground">
                {prettyMs(data.avgProveTime)}
              </span>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex-col items-start gap-y-4 border-t pt-6 text-xs text-muted-foreground">
        <div className="flex flex-wrap gap-4 text-xs">
          {(
            [
              { key: "queue", color: PHASE_COLORS.queue },
              { key: "prove", color: PHASE_COLORS.prove },
            ] as const
          ).map(({ key, color }) => (
            <div key={key} className="flex items-center gap-1.5">
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span>{key}</span>
            </div>
          ))}
        </div>
        <div className="min-h-14">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-placeholder">Key insight:</span>{" "}
            Blue (prove) dominates — this is expected. If orange (queue) grows
            disproportionately, investigate infrastructure bottlenecks. Yellowed
            block numbers indicate stunners/paralyzers.
          </p>
        </div>
      </CardFooter>
    </Card>
  )
}
