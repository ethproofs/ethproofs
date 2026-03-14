"use client"

import { useMemo, useState } from "react"
import {
  Bar,
  BarChart,
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

import type { ProofVolumeData } from "@/lib/api/teams-metrics"
import { formatNumber } from "@/lib/number"

const DAY_OPTIONS = [7, 30] as const
type DayOption = (typeof DAY_OPTIONS)[number]

interface ChartEntry {
  teamName: string
  totalProofs: number
  rtpProofs: number
  nonRtpProofs: number
  growthRate: number
  hasRtpProver: boolean
}

function computeGrowthRate(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

interface VolumeTooltipProps {
  active?: boolean
  payload?: Array<{
    value: number
    name: string
    dataKey: string
    payload: ChartEntry
  }>
}

function VolumeTooltip({ active, payload }: VolumeTooltipProps) {
  if (!active || !payload?.length) return null
  const entry = payload[0].payload

  return (
    <div className="rounded-md border bg-background px-3 py-2 text-xs shadow-md">
      <div className="mb-1 font-medium">{entry.teamName}</div>
      <div className="flex items-center gap-2">
        <span className="inline-block size-2 rounded-full bg-chart-12" />
        total proofs: {formatNumber(entry.totalProofs)}
      </div>
      <div className="flex items-center gap-2">
        <span className="inline-block size-2 rounded-full bg-chart-5" />
        RTP proofs: {formatNumber(entry.rtpProofs)}
      </div>
      <div className="text-muted-foreground">
        growth: {entry.growthRate > 0 ? "+" : ""}
        {entry.growthRate.toFixed(1)}%
      </div>
    </div>
  )
}

export function ProofVolumeChart() {
  const [days, setDays] = useState<DayOption>(7)

  const { data, isLoading } = useQuery<ProofVolumeData>({
    queryKey: ["teams-volume", days],
    queryFn: async () => {
      const response = await fetch(`/api/teams/volume?days=${days}`)
      return response.json()
    },
  })

  const chartData = useMemo<ChartEntry[]>(() => {
    if (!data) return []
    return data.teams.map((team) => ({
      teamName: team.teamName,
      totalProofs: team.totalProofs,
      rtpProofs: team.rtpProofs,
      nonRtpProofs: team.totalProofs - team.rtpProofs,
      growthRate: computeGrowthRate(team.totalProofs, team.previousTotalProofs),
      hasRtpProver: team.hasRtpProver,
    }))
  }, [data])

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-row flex-wrap items-start justify-between gap-2 space-y-0">
        <div className="space-y-1.5">
          <CardTitle className="text-lg">proof volume by team</CardTitle>
          <CardDescription>
            who&apos;s generating the most proofs
          </CardDescription>
        </div>
        <Tabs
          value={String(days)}
          onValueChange={(v) => setDays(Number(v) as DayOption)}
        >
          <TabsList className="border-none">
            {DAY_OPTIONS.map((d) => (
              <TabsTrigger
                key={d}
                value={String(d)}
                className="cursor-default border-none px-3 py-1 text-xs"
              >
                {d}d
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="flex-1">
        {data && (
          <div className="mb-4 grid grid-cols-3 gap-4">
            <div className="rounded-lg bg-muted/50 px-3 py-2">
              <div className="text-xs text-muted-foreground">total proofs</div>
              <div className="font-mono text-sm font-semibold">
                {formatNumber(data.totalProofs)}
              </div>
            </div>
            <div className="rounded-lg bg-muted/50 px-3 py-2">
              <div className="text-xs text-muted-foreground">RTP proofs</div>
              <div className="font-mono text-sm font-semibold">
                {formatNumber(data.rtpProofs)}
              </div>
            </div>
            <div className="rounded-lg bg-muted/50 px-3 py-2">
              <div className="text-xs text-muted-foreground">RTP share</div>
              <div className="font-mono text-sm font-semibold">
                {data.rtpShare.toFixed(1)}%
              </div>
            </div>
          </div>
        )}
        {isLoading ? (
          <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
            loading chart data...
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
            no data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={chartData.length * 40 + 20}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 10, right: 60, left: 0, bottom: 0 }}
            >
              <XAxis
                type="number"
                tickFormatter={(v: number) => formatNumber(v)}
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="teamName"
                width={100}
                tick={({
                  x,
                  y,
                  payload,
                }: {
                  x: number
                  y: number
                  payload: { value: string }
                }) => {
                  const entry = chartData.find(
                    (e) => e.teamName === payload.value
                  )
                  return (
                    <g transform={`translate(${x},${y})`}>
                      {entry?.hasRtpProver && (
                        <circle
                          cx={-8}
                          cy={0}
                          r={3}
                          fill="hsl(var(--chart-5))"
                        />
                      )}
                      <text
                        x={-16}
                        y={0}
                        dy={4}
                        textAnchor="end"
                        fontSize={11}
                        fill="hsl(var(--foreground))"
                      >
                        {payload.value}
                      </text>
                    </g>
                  )
                }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={<VolumeTooltip />}
                cursor={{ fill: "hsl(var(--muted)/0.2)" }}
              />
              <Bar
                dataKey="nonRtpProofs"
                stackId="proofs"
                fill="hsl(var(--chart-12))"
                radius={0}
              />
              <Bar
                dataKey="rtpProofs"
                stackId="proofs"
                fill="hsl(var(--chart-5))"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
      <CardFooter className="flex-col items-start gap-y-4 border-t pt-6 text-xs text-muted-foreground">
        <div className="flex w-full items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <span className="inline-block size-2 rounded-full bg-chart-12" />
            total proofs
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block size-2 rounded-full bg-chart-5" />
            RTP proofs - has RTP prover
          </div>
          <div className="ml-auto text-muted-foreground">
            vs. previous {days}d
          </div>
        </div>
        <div className="min-h-10">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-placeholder">Key insight:</span>{" "}
            Green portion shows RTP-eligible proofs. Teams with green dots next
            to their names have at least one RTP-eligible prover. Growth rates
            show momentum — high growth teams are scaling their operations.
          </p>
        </div>
      </CardFooter>
    </Card>
  )
}
