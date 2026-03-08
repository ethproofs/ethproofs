"use client"

import { useMemo, useState } from "react"
import { Cell, Pie, PieChart, ResponsiveContainer, Sector } from "recharts"

import type { GuestDistributionEntry } from "@/lib/types"

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
  "hsl(var(--chart-13))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-11))",
  "hsl(var(--chart-15))",
  "hsl(var(--chart-8))",
  "hsl(var(--chart-12))",
] as const

const HEALTHY_THRESHOLD = 50
const WARNING_THRESHOLD = 75

interface ChartEntry {
  name: string
  value: number
  color: string
}

function isActiveShapeProps(props: unknown): props is {
  cx: number
  cy: number
  innerRadius: number
  outerRadius: number
  startAngle: number
  endAngle: number
  fill: string
} {
  if (typeof props !== "object" || props === null) return false
  const p = props as Record<string, unknown>
  return (
    typeof p.cx === "number" &&
    typeof p.cy === "number" &&
    typeof p.innerRadius === "number" &&
    typeof p.outerRadius === "number" &&
    typeof p.startAngle === "number" &&
    typeof p.endAngle === "number" &&
    typeof p.fill === "string"
  )
}

function renderActiveShape(props: unknown) {
  if (!isActiveShapeProps(props)) return <></>
  return (
    <Sector
      cx={props.cx}
      cy={props.cy}
      innerRadius={props.innerRadius - 2}
      outerRadius={props.outerRadius + 6}
      startAngle={props.startAngle}
      endAngle={props.endAngle}
      fill={props.fill}
    />
  )
}

interface GuestDiversityCurrentChartProps {
  data: GuestDistributionEntry[]
}

export function GuestDiversityCurrentChart({
  data,
}: GuestDiversityCurrentChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const dominant = data[0]
  const isDominantCritical = dominant && dominant.share >= WARNING_THRESHOLD
  const isDominantWarning =
    dominant &&
    dominant.share >= HEALTHY_THRESHOLD &&
    dominant.share < WARNING_THRESHOLD
  const isDominantHealthy = dominant && dominant.share < HEALTHY_THRESHOLD

  const chartData: ChartEntry[] = useMemo(
    () =>
      data.map((entry, index) => ({
        name: entry.name,
        value: Number(entry.share.toFixed(1)),
        color: CHART_COLORS[index % CHART_COLORS.length],
      })),
    [data]
  )

  const centerLabel =
    activeIndex !== null && chartData[activeIndex]
      ? chartData[activeIndex]
      : dominant
        ? { name: dominant.name, value: Number(dominant.share.toFixed(1)) }
        : null

  return (
    <Card className="flex h-full min-h-80 flex-col">
      <CardHeader>
        <CardTitle className="text-lg">guest diversity, current</CardTitle>
        <CardDescription>share of proofs by guest program (7d)</CardDescription>
        {dominant && isDominantCritical && (
          <div className="mt-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            CRITICAL: {dominant.name} represents {dominant.share.toFixed(0)}% of
            all proofs
          </div>
        )}
        {dominant && isDominantWarning && (
          <div className="mt-2 rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-sm text-warning">
            WARNING: {dominant.name} represents {dominant.share.toFixed(0)}% of
            all proofs
          </div>
        )}
        {dominant && isDominantHealthy && (
          <div className="mt-2 rounded-md border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
            HEALTHY: no single guest exceeds {HEALTHY_THRESHOLD}% of all proofs
          </div>
        )}
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4">
        {data.length === 0 ? (
          <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
            no diversity data available
          </div>
        ) : (
          <>
            <div className="relative">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={2}
                    dataKey="value"
                    activeIndex={activeIndex ?? undefined}
                    activeShape={renderActiveShape}
                    onMouseEnter={(_, index) => setActiveIndex(index)}
                    onMouseLeave={() => setActiveIndex(null)}
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke="hsl(var(--card))"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {centerLabel && (
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold">
                    {centerLabel.value}%
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {centerLabel.name}
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {chartData.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="size-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs">{item.name}</span>
                  </div>
                  <span
                    className="font-mono text-xs font-semibold"
                    style={{ color: item.color }}
                  >
                    {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>

      <CardFooter className="flex-col items-start gap-y-4 border-t pt-6 text-xs text-muted-foreground">
        <div className="flex flex-wrap items-center gap-4">
          <span>concentration thresholds:</span>
          <div className="flex items-center gap-1">
            <div className="size-2 rounded-full bg-green-500" />
            <span>&lt;{HEALTHY_THRESHOLD}% healthy</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="size-2 rounded-full bg-yellow-500" />
            <span>
              {HEALTHY_THRESHOLD}-{WARNING_THRESHOLD}% warning
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="size-2 rounded-full bg-red-500" />
            <span>&gt;{WARNING_THRESHOLD}% critical</span>
          </div>
        </div>
        <div className="min-h-14">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-placeholder">Key insight:</span>{" "}
            No single guest should dominate proof generation. A diverse
            ecosystem ensures that a bug or vulnerability in one EVM
            implementation doesn&apos;t compromise the entire proving network.
          </p>
        </div>
      </CardFooter>
    </Card>
  )
}
