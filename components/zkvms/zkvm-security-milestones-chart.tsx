"use client"

import { useMemo } from "react"
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import type { MilestoneStatus, ZkvmMilestoneEntry } from "@/lib/types"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tooltip as UiTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const MILESTONE_KEYS = ["m1", "m2a", "m2b", "m3a", "m3b"] as const

const MILESTONE_LABELS: Record<(typeof MILESTONE_KEYS)[number], string> = {
  m1: "M1",
  m2a: "M2a",
  m2b: "M2b",
  m3a: "M3a",
  m3b: "M3b",
}

const MILESTONE_DESCRIPTIONS: Record<(typeof MILESTONE_KEYS)[number], string> =
  {
    m1: "soundcalc integration",
    m2a: "\u2265100-bit security",
    m2b: "\u2264600 KiB proof size",
    m3a: "\u2265128-bit security",
    m3b: "\u2264300 KiB proof size",
  }

const STATUS_COLORS: Record<MilestoneStatus, string> = {
  achieved: "hsl(var(--level-best))",
  in_progress: "hsl(var(--level-middle))",
  not_yet: "hsl(var(--muted))",
}

interface ChartRow {
  zkvmName: string
  m1: number
  m2a: number
  m2b: number
  m3a: number
  m3b: number
  statuses: Record<string, MilestoneStatus>
}

function buildChartData(data: ZkvmMilestoneEntry[]): ChartRow[] {
  return data.map((entry) => ({
    zkvmName: entry.zkvmName,
    m1: 1,
    m2a: 1,
    m2b: 1,
    m3a: 1,
    m3b: 1,
    statuses: {
      m1: entry.m1,
      m2a: entry.m2a,
      m2b: entry.m2b,
      m3a: entry.m3a,
      m3b: entry.m3b,
    },
  }))
}

interface MilestoneTickProps {
  x: number
  y: number
  payload: { value: number }
}

function MilestoneTick({ x, y, payload }: MilestoneTickProps) {
  const idx = Math.floor(payload.value)
  const key = MILESTONE_KEYS[idx]
  if (!key) return <g />

  const label = MILESTONE_LABELS[key]
  const description = MILESTONE_DESCRIPTIONS[key]

  return (
    <g transform={`translate(${x},${y})`}>
      <foreignObject x={-30} y={4} width={60} height={24}>
        <TooltipProvider delayDuration={100}>
          <UiTooltip>
            <TooltipTrigger asChild>
              <span className="flex cursor-help justify-center text-[11px] text-muted-foreground">
                {label}
              </span>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p className="text-xs">{description}</p>
            </TooltipContent>
          </UiTooltip>
        </TooltipProvider>
      </foreignObject>
    </g>
  )
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ payload: ChartRow; dataKey: string }>
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const row = payload[0].payload

  return (
    <div className="min-w-44 rounded-lg border bg-card p-3 shadow-xl">
      <p className="mb-2 text-sm font-semibold">{label}</p>
      <div className="space-y-1.5">
        {MILESTONE_KEYS.map((key) => {
          const status = row.statuses[key]
          return (
            <div key={key} className="flex items-center justify-between gap-4">
              <span className="text-xs text-muted-foreground">
                {MILESTONE_LABELS[key]}
              </span>
              <div className="flex items-center gap-1.5">
                <div
                  className="size-2 rounded-full"
                  style={{ backgroundColor: STATUS_COLORS[status] }}
                />
                <span className="text-xs font-medium">
                  {status.replace("_", " ")}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface ZkvmSecurityMilestonesChartProps {
  data: ZkvmMilestoneEntry[]
}

export function ZkvmSecurityMilestonesChart({
  data,
}: ZkvmSecurityMilestonesChartProps) {
  const chartData = useMemo(() => buildChartData(data), [data])
  const chartHeight = Math.max(200, data.length * 48 + 60)

  return (
    <Card className="flex h-full min-h-80 flex-col">
      <CardHeader>
        <CardTitle className="text-lg">security milestones</CardTitle>
        <CardDescription>
          track which zkVMs are furthest along the security roadmap
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1">
        {data.length === 0 ? (
          <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
            no milestone data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 0, right: 10, left: 0, bottom: 20 }}
              barCategoryGap="20%"
            >
              <XAxis
                type="number"
                domain={[0, 5]}
                axisLine={false}
                tickLine={false}
                ticks={[0.5, 1.5, 2.5, 3.5, 4.5]}
                tick={MilestoneTick}
              />
              <YAxis
                type="category"
                dataKey="zkvmName"
                axisLine={false}
                tickLine={false}
                width={110}
                tick={{
                  fill: "hsl(var(--foreground))",
                  fontSize: 12,
                  fontWeight: 500,
                }}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "hsl(var(--muted))", fillOpacity: 0.2 }}
              />
              {MILESTONE_KEYS.map((key) => (
                <Bar
                  key={key}
                  dataKey={key}
                  stackId="milestones"
                  radius={0}
                  barSize={24}
                >
                  {chartData.map((row, index) => (
                    <Cell
                      key={`${key}-${index}`}
                      fill={STATUS_COLORS[row.statuses[key]]}
                    />
                  ))}
                </Bar>
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>

      <CardFooter className="flex-wrap justify-between gap-x-4 gap-y-4 border-t pt-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div
              className="size-2 rounded-full"
              style={{ backgroundColor: STATUS_COLORS.achieved }}
            />
            <span>achieved</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div
              className="size-2 rounded-full"
              style={{ backgroundColor: STATUS_COLORS.in_progress }}
            />
            <span>in progress</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div
              className="size-2 rounded-full"
              style={{ backgroundColor: STATUS_COLORS.not_yet }}
            />
            <span>not yet</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
