"use client"

import { useMemo } from "react"
import {
  CartesianGrid,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts"
import { useQuery } from "@tanstack/react-query"

import type { ProverScatterPoint } from "@/lib/types"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { RTP_PERFORMANCE_SCORE_THRESHOLD } from "@/lib/constants"

import { formatUsd } from "@/lib/number"

const PERSONA_LEGEND = [
  { label: "1:1 on-prem", color: "hsl(var(--chart-2))" },
  { label: "1:1 cloud", color: "hsl(var(--chart-9))" },
  { label: "1:100 on-prem", color: "hsl(var(--chart-12))" },
  { label: "1:100 cloud", color: "hsl(var(--chart-14))" },
] as const

function getPersonaColor(persona: string): string {
  const key = persona.toLowerCase()
  if (key.includes("1:1") && key.includes("on-prem"))
    return PERSONA_LEGEND[0].color
  if (key.includes("1:1") && key.includes("cloud"))
    return PERSONA_LEGEND[1].color
  if (key.includes("1:100") && key.includes("on-prem"))
    return PERSONA_LEGEND[2].color
  if (key.includes("1:100") && key.includes("cloud"))
    return PERSONA_LEGEND[3].color
  return "hsl(var(--chart-8))"
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ payload?: ProverScatterPoint }>
}) {
  if (!active || !payload?.length) return null
  const point = payload[0]?.payload
  if (!point) return null

  return (
    <div className="rounded-md border border-border bg-card px-3 py-2 text-xs shadow-md">
      <p className="mb-1 font-semibold">
        {point.teamName} — {point.clusterName}
      </p>
      <div className="space-y-0.5 text-muted-foreground">
        <p>cost per proof: {formatUsd(point.avgCost)}</p>
        <p>performance: {point.performanceScore.toFixed(2)}%</p>
        <p>liveness: {point.livenessScore.toFixed(1)}%</p>
      </div>
    </div>
  )
}

export function PerformanceCostChart() {
  const { data = [], isLoading } = useQuery<ProverScatterPoint[]>({
    queryKey: ["provers-scatter"],
    queryFn: async () => {
      const response = await fetch("/api/provers/scatter")
      return response.json()
    },
  })

  const groupedByPersona = useMemo(() => {
    const groups = new Map<string, ProverScatterPoint[]>()
    for (const point of data) {
      const key = point.persona.toLowerCase()
      if (key.startsWith("1:100")) continue
      const existing = groups.get(key) ?? []
      existing.push(point)
      groups.set(key, existing)
    }
    return groups
  }, [data])

  const samplingProvers = useMemo(
    () => data.filter((d) => d.persona.toLowerCase().startsWith("1:100")),
    [data]
  )

  return (
    <Card className="flex h-full min-h-80 flex-col">
      <CardHeader>
        <CardTitle className="text-lg">performance vs. cost</CardTitle>
        <CardDescription>
          efficiency frontier — best performance per dollar
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1">
        {isLoading ? (
          <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
            loading chart data...
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
            no data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={380}>
            <ScatterChart margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="avgCost"
                type="number"
                name="cost per proof"
                tickLine={false}
                axisLine={false}
                fontSize={11}
                tickFormatter={(v: number) =>
                  formatUsd(v, {
                    minimumFractionDigits: 3,
                    maximumFractionDigits: 3,
                  })
                }
                label={{
                  value: "cost per proof ($)",
                  position: "insideBottom",
                  offset: -5,
                  fill: "hsl(var(--muted-foreground))",
                  fontSize: 11,
                }}
              />
              <YAxis
                dataKey="performanceScore"
                type="number"
                name="performance"
                tickLine={false}
                axisLine={false}
                fontSize={11}
                tickFormatter={(v: number) => `${v.toFixed(0)}%`}
                width={25}
                domain={[0, 100]}
                ticks={[0, 25, 50, RTP_PERFORMANCE_SCORE_THRESHOLD, 100]}
              />
              <ZAxis
                dataKey="livenessScore"
                type="number"
                range={[60, 400]}
                name="liveness"
              />
              <ReferenceLine
                y={RTP_PERFORMANCE_SCORE_THRESHOLD}
                stroke="hsl(var(--success))"
                strokeDasharray="6 4"
                strokeWidth={1.5}
              />
              <Legend
                payload={PERSONA_LEGEND.map((entry) => ({
                  value: entry.label,
                  type: "line" as const,
                  color: entry.color,
                }))}
                wrapperStyle={{
                  cursor: "pointer",
                  fontSize: 12,
                  paddingTop: 28,
                }}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ strokeDasharray: "3 3" }}
              />
              {Array.from(groupedByPersona.entries()).map(
                ([persona, points]) => (
                  <Scatter
                    key={persona}
                    name={persona}
                    data={points}
                    fill={getPersonaColor(persona)}
                    stroke={getPersonaColor(persona)}
                    strokeWidth={2}
                    fillOpacity={0.6}
                  />
                )
              )}
            </ScatterChart>
          </ResponsiveContainer>
        )}

        {samplingProvers.length > 0 && (
          <div className="mt-4 rounded-lg border border-border px-4 py-3">
            <p className="mb-1 text-xs text-muted-foreground">
              1:100 sampling provers (not shown on chart):
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {samplingProvers.map((p) => (
                <span key={p.clusterName} className="text-xs">
                  <span
                    className="mr-1 inline-block size-2 rounded-full"
                    style={{ backgroundColor: getPersonaColor(p.persona) }}
                  />
                  {p.teamName}: {formatUsd(p.avgCost)}
                </span>
              ))}
            </div>
            <p className="mt-1 text-xs italic text-muted-foreground">
              performance scores not applicable for 1:100 sampling mode
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex-col items-start gap-y-4 border-t pt-6 text-xs text-muted-foreground">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <svg width="24" height="2">
              <line
                x1="0"
                y1="1"
                x2="24"
                y2="1"
                stroke="hsl(var(--success))"
                strokeWidth="2"
                strokeDasharray="4 3"
              />
            </svg>
            <span>{RTP_PERFORMANCE_SCORE_THRESHOLD}% RTP threshold</span>
          </div>
          <span>bubble size = liveness score</span>
        </div>
        <div className="min-h-10">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-placeholder">Key insight:</span>{" "}
            Top-left quadrant is the efficiency frontier — high performance, low
            cost. Larger bubbles indicate better liveness.
          </p>
        </div>
      </CardFooter>
    </Card>
  )
}
