"use client"

import { useMemo, useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts"
import { keepPreviousData, useQuery } from "@tanstack/react-query"

import type { PersonaComparisonData } from "@/lib/types"

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

import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"

import { formatUsd } from "@/lib/number"
import { prettyMs } from "@/lib/time"

type ViewMode = "bars" | "radar"

const RANGE_OPTIONS = [
  { label: "24h", days: 1 },
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
] as const

type RangeDays = (typeof RANGE_OPTIONS)[number]["days"]

const PERSONA_COLORS = [
  "hsl(var(--chart-2))",
  "hsl(var(--chart-9))",
  "hsl(var(--chart-12))",
  "hsl(var(--chart-14))",
] as const

function getPersonaColor(index: number): string {
  return PERSONA_COLORS[index % PERSONA_COLORS.length]
}

interface RadarEntry {
  metric: string
  [persona: string]: string | number
}

function buildRadarData(data: PersonaComparisonData[]): RadarEntry[] {
  const metrics = [
    "performance",
    "liveness",
    "proof count",
    "prover count",
  ] as const

  return metrics.map((metric) => {
    const entry: RadarEntry = { metric }
    for (const persona of data) {
      switch (metric) {
        case "performance":
          entry[persona.persona] = persona.performanceScore
          break
        case "liveness":
          entry[persona.persona] = persona.livenessScore
          break
        case "proof count":
          entry[persona.persona] = Math.min(persona.proofCount / 10, 100)
          break
        case "prover count":
          entry[persona.persona] = Math.min(persona.proverCount * 10, 100)
          break
      }
    }
    return entry
  })
}

type MetricKey = "performance" | "liveness" | "avgLatency" | "avgCost"

interface MetricBarEntry {
  metric: string
  metricKey: MetricKey
  [key: string]: string | number
}

function buildMetricBarData(data: PersonaComparisonData[]): MetricBarEntry[] {
  return [
    {
      metric: "Performance",
      metricKey: "performance",
      ...Object.fromEntries(data.map((p) => [p.persona, p.performanceScore])),
    },
    {
      metric: "Liveness",
      metricKey: "liveness",
      ...Object.fromEntries(data.map((p) => [p.persona, p.livenessScore])),
    },
    {
      metric: "Avg Latency",
      metricKey: "avgLatency",
      ...Object.fromEntries(data.map((p) => [p.persona, p.avgLatency / 1000])),
    },
    {
      metric: "Avg Cost",
      metricKey: "avgCost",
      ...Object.fromEntries(data.map((p) => [p.persona, p.avgCost * 100])),
    },
  ]
}

export function PersonaComparisonChart() {
  const [rangeDays, setRangeDays] = useState<RangeDays>(7)
  const [viewMode, setViewMode] = useState<ViewMode>("bars")

  const {
    data: rawData,
    isLoading,
    isFetching,
  } = useQuery<PersonaComparisonData[]>({
    queryKey: ["persona-comparison", rangeDays],
    queryFn: async () => {
      const response = await fetch(`/api/metrics/persona?days=${rangeDays}`)
      return response.json()
    },
    placeholderData: keepPreviousData,
  })

  const personas = useMemo(() => rawData ?? [], [rawData])
  const metricBarData = useMemo(() => buildMetricBarData(personas), [personas])
  const radarData = useMemo(() => buildRadarData(personas), [personas])

  return (
    <Card className="flex h-full min-h-80 flex-col">
      <CardHeader className="flex-row flex-wrap items-start justify-between gap-2 space-y-0">
        <div className="space-y-1.5">
          <CardTitle className="text-lg">prover persona comparison</CardTitle>
          <CardDescription>performance metrics by prover type</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 rounded-lg bg-muted p-1">
            {(["bars", "radar"] as const).map((mode) => (
              <Button
                key={mode}
                onClick={() => setViewMode(mode)}
                size="sm"
                variant="ghost"
                className={cn(
                  "h-7 px-2 text-xs",
                  viewMode === mode && "bg-background text-foreground shadow-sm"
                )}
              >
                {mode}
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

      <CardContent
        className="flex-1 transition-opacity duration-200"
        style={{ opacity: isFetching && !isLoading ? 0.6 : 1 }}
      >
        {personas.length > 0 && (
          <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {personas.map((p, i) => (
              <Tooltip key={p.persona}>
                <TooltipTrigger
                  key={p.persona}
                  className="rounded-lg bg-muted/50 px-3 py-2 text-start"
                  style={{ borderLeft: `3px solid ${getPersonaColor(i)}` }}
                >
                  <span className="truncate text-xs text-muted-foreground">
                    {p.persona}
                  </span>
                  <p className="font-mono text-sm font-semibold">
                    {p.proverCount} provers
                  </p>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  style={{
                    borderColor: getPersonaColor(i),
                    color: getPersonaColor(i),
                  }}
                >
                  <p className="text-xs">
                    {p.proofCount.toLocaleString()} proofs
                  </p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        )}

        {isLoading ? (
          <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
            loading chart data...
          </div>
        ) : viewMode === "bars" ? (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={metricBarData}
              margin={{ top: 5, right: 0, left: 0, bottom: 0 }}
              layout="vertical"
            >
              <CartesianGrid
                horizontal={false}
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                type="number"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                hide
              />
              <YAxis
                type="category"
                dataKey="metric"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                width={75}
              />
              <RechartsTooltip
                cursor={{ fill: "hsl(var(--muted))", fillOpacity: 0.2 }}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "calc(var(--radius) - 2px)",
                  color: "hsl(var(--foreground))",
                  fontSize: 12,
                  padding: "8px 12px",
                }}
                formatter={(
                  value: number,
                  name: string,
                  item: { payload?: MetricBarEntry }
                ) => {
                  const metricKey = item.payload?.metricKey
                  if (metricKey === "avgLatency")
                    return [prettyMs(value * 1000), name]
                  if (metricKey === "avgCost")
                    return [formatUsd(value / 100), name]
                  return [`${value.toFixed(1)}%`, name]
                }}
              />
              {personas.map((p, i) => (
                <Bar
                  key={p.persona}
                  dataKey={p.persona}
                  fill={getPersonaColor(i)}
                  radius={[0, 4, 4, 0]}
                  barSize={8}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="metric" fontSize={11} />
              <PolarRadiusAxis fontSize={10} domain={[0, 100]} />
              {personas.map((p, i) => (
                <Radar
                  key={p.persona}
                  name={p.persona}
                  dataKey={p.persona}
                  stroke={getPersonaColor(i)}
                  fill={getPersonaColor(i)}
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              ))}
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "calc(var(--radius) - 2px)",
                  color: "hsl(var(--foreground))",
                  fontSize: 12,
                  padding: "8px 12px",
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        )}
      </CardContent>

      <CardFooter className="flex-wrap justify-between gap-x-4 gap-y-4 border-t pt-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          {personas.map((p, i) => (
            <div key={p.persona} className="flex items-center gap-1.5">
              <div
                className="size-2 rounded-full"
                style={{ backgroundColor: getPersonaColor(i) }}
              />
              <span>{p.persona}</span>
            </div>
          ))}
        </div>
        <div className="min-h-14">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-placeholder">Key insight:</span>{" "}
            1:1 on-prem leads on performance and cost efficiency. 1:1 cloud
            trades slightly higher cost for operational flexibility. 1:100
            provers (sampling mode) don&apos;t have performance scores but offer
            lowest cost entry point.
          </p>
        </div>
      </CardFooter>
    </Card>
  )
}
