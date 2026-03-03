"use client"

import { useMemo, useState } from "react"
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import type { RtpProofTimeDistributionData } from "@/lib/types"

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
  { label: "24h", days: 1 },
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
] as const

type RangeDays = (typeof RANGE_OPTIONS)[number]["days"]

const BAR_COLORS = {
  rtp: "hsl(var(--level-best))",
  stunner: "hsl(var(--muted-foreground))",
} as const

const THRESHOLD_BUCKET = {
  bucket: "10s",
  percentage: 0,
  count: 0,
  isRtp: false,
  isThreshold: true,
}

interface ChartBucket {
  bucket: string
  percentage: number
  count: number
  isRtp: boolean
  isThreshold?: boolean
}

function buildChartData(data: RtpProofTimeDistributionData): ChartBucket[] {
  const rtpBuckets = data.buckets.filter((b) => b.isRtp)
  const stunnerBuckets = data.buckets.filter((b) => !b.isRtp)
  return [...rtpBuckets, THRESHOLD_BUCKET, ...stunnerBuckets]
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ payload: ChartBucket }>
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const item = payload[0].payload
  if (item.isThreshold) return null

  return (
    <div className="min-w-44 rounded-lg border bg-card p-3 shadow-xl">
      <div className="mb-2 flex items-center gap-2">
        <div
          className="size-2.5 rounded-sm"
          style={{
            backgroundColor: item.isRtp ? BAR_COLORS.rtp : BAR_COLORS.stunner,
          }}
        />
        <p className="text-sm font-semibold">{item.bucket}</p>
      </div>
      <div className="space-y-1.5">
        <div className="flex justify-between">
          <span className="text-xs text-muted-foreground">percentage</span>
          <span className="font-mono text-xs font-semibold">
            {item.percentage.toFixed(1)}%
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-muted-foreground">proof count</span>
          <span className="font-mono text-xs">
            {item.count.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-muted-foreground">status</span>
          <span
            className="text-xs font-medium"
            style={{
              color: item.isRtp ? BAR_COLORS.rtp : BAR_COLORS.stunner,
            }}
          >
            {item.isRtp ? "\u2713 RTP eligible" : "stunner"}
          </span>
        </div>
      </div>
    </div>
  )
}

interface RtpProofTimeDistributionProps {
  dataByRange: Record<number, RtpProofTimeDistributionData>
}

export function RtpProofTimeDistribution({
  dataByRange,
}: RtpProofTimeDistributionProps) {
  const [rangeDays, setRangeDays] = useState<RangeDays>(7)

  const data = dataByRange[rangeDays] ?? dataByRange[7]
  const chartData = useMemo(() => buildChartData(data), [data])

  return (
    <Card className="flex h-full min-h-80 flex-col">
      <CardHeader className="flex-row flex-wrap items-start justify-between gap-2 space-y-0">
        <div className="space-y-1.5">
          <CardTitle className="text-lg">RTP proof time distribution</CardTitle>
          <CardDescription>timing distribution across blocks</CardDescription>
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

      <CardContent className="flex flex-1 flex-col gap-4 lg:flex-row 2xl:flex-col">
        <div className="grid grid-cols-3 gap-3 lg:w-44 lg:shrink-0 lg:grid-cols-1 lg:gap-2 2xl:w-full 2xl:grid-cols-3 2xl:gap-3">
          <div className="flex flex-col gap-1 rounded-lg bg-muted/50 px-3 py-2">
            <span className="text-xs text-muted-foreground">total proofs</span>
            <span className="font-mono text-lg font-semibold">
              {data.total.toLocaleString()}
            </span>
          </div>
          <div className="flex flex-col gap-1 rounded-lg bg-muted/50 px-3 py-2">
            <span className="text-xs text-muted-foreground">sub-10s (RTP)</span>
            <span className="font-mono text-lg font-semibold text-primary">
              {data.rtpTotal.toLocaleString()}
            </span>
          </div>
          <div className="flex flex-col gap-1 rounded-lg bg-muted/50 px-3 py-2">
            <span className="text-xs text-muted-foreground">RTP rate</span>
            <span className="font-mono text-lg font-semibold text-primary">
              {data.rtpRate}%
            </span>
          </div>
        </div>

        <div className="flex-1 lg:min-w-0">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
              barCategoryGap="15%"
            >
              <XAxis
                type="number"
                domain={[0, 100]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                tickFormatter={(value: number) => `${value}%`}
                ticks={[0, 20, 40, 60, 80, 100]}
              />
              <YAxis
                type="category"
                dataKey="bucket"
                axisLine={false}
                tickLine={false}
                width={56}
                tick={({
                  x,
                  y,
                  payload,
                }: {
                  x: number
                  y: number
                  payload: { value: string }
                }) => {
                  if (payload.value === "10s") return <g />
                  const isRtp = chartData.find(
                    (b) => b.bucket === payload.value
                  )?.isRtp
                  return (
                    <g transform={`translate(${x},${y})`}>
                      <text
                        x={-8}
                        y={0}
                        dy={4}
                        textAnchor="end"
                        fill={
                          isRtp
                            ? "hsl(var(--level-best))"
                            : "hsl(var(--muted-foreground))"
                        }
                        fontSize={12}
                        fontWeight={500}
                      >
                        {payload.value}
                      </text>
                    </g>
                  )
                }}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "hsl(var(--muted))", fillOpacity: 0.2 }}
              />
              <Bar dataKey="percentage" radius={[0, 4, 4, 0]} barSize={24}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.isThreshold
                        ? "transparent"
                        : entry.isRtp
                          ? BAR_COLORS.rtp
                          : BAR_COLORS.stunner
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>

      <CardFooter className="flex-wrap justify-between gap-x-4 gap-y-4 border-t pt-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="size-2 rounded-full bg-primary" />
            <span>{"\u2264"}10s (RTP eligible)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="size-2 rounded-full bg-muted-foreground" />
            <span>&gt;10s (stunners)</span>
          </div>
        </div>
        <div className="min-h-14">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-placeholder">Key insight:</span>{" "}
            Green bars above the threshold are RTP-eligible. Most proofs should
            cluster in the 8-10s bucket. If 0-5s grows, proving is getting
            faster. If gray bars grow, investigate the cause.
          </p>
        </div>
      </CardFooter>
    </Card>
  )
}
