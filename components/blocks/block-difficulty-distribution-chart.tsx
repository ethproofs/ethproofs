"use client"

import { useMemo, useState } from "react"
import {
  CartesianGrid,
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

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { cn } from "@/lib/utils"

import { RTP_PERFORMANCE_TIME_THRESHOLD_MS } from "@/lib/constants"

import type {
  BlockDifficultyPoint,
  BlocksMetricsData,
} from "@/lib/api/blocks-metrics"
import { formatNumber } from "@/lib/number"
import { prettyMs } from "@/lib/time"

const CATEGORY_CONFIG = {
  success: {
    label: "success",
    color: "hsl(var(--primary))",
  },
  stunner: {
    label: "stunners",
    color: "hsl(var(--warning))",
  },
  paralyzer: {
    label: "paralyzers",
    color: "hsl(var(--destructive))",
  },
} as const

type FilterCategory = "all" | "success" | "stunner" | "paralyzer"

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ payload?: BlockDifficultyPoint }>
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
        <p>gas used: {(point.gasUsed / 1e6).toFixed(1)}M</p>
        <p>proving time: {prettyMs(point.bestProvingTime)}</p>
        <p>proof count: {point.proofCount}</p>
        <p>
          status:{" "}
          <span
            style={{
              color: CATEGORY_CONFIG[point.category].color,
            }}
          >
            {CATEGORY_CONFIG[point.category].label}
          </span>
        </p>
      </div>
    </div>
  )
}

export function BlockDifficultyDistributionChart() {
  const [activeFilter, setActiveFilter] = useState<FilterCategory>("all")

  const { data, isLoading } = useQuery<BlocksMetricsData>({
    queryKey: ["blocks-chart-data"],
    queryFn: async () => {
      const response = await fetch("/api/blocks/metrics?type=charts")
      return response.json()
    },
    staleTime: 60_000,
  })

  const categoryCounts = useMemo(() => {
    if (!data) return { success: 0, stunner: 0, paralyzer: 0 }
    const counts = { success: 0, stunner: 0, paralyzer: 0 }
    for (const point of data.blockDifficulty) {
      counts[point.category]++
    }
    return counts
  }, [data])

  const issuePattern = useMemo(() => {
    if (!data || data.blockDifficulty.length < 4) return null
    const sorted = [...data.blockDifficulty].sort(
      (a, b) => a.gasUsed - b.gasUsed
    )
    const medianGas = sorted[Math.floor(sorted.length / 2)].gasUsed
    const isIssueBlock = (p: BlockDifficultyPoint) =>
      p.category === "stunner" || p.category === "paralyzer"
    const aboveMedian = sorted.filter((p) => p.gasUsed >= medianGas)
    const aboveIssues = aboveMedian.filter(isIssueBlock)
    const belowMedian = sorted.filter((p) => p.gasUsed < medianGas)
    const belowIssues = belowMedian.filter(isIssueBlock)
    if (aboveMedian.length === 0 || belowMedian.length === 0) return null
    const aboveRate = aboveIssues.length / aboveMedian.length
    const belowRate = belowIssues.length / belowMedian.length
    if (aboveRate <= belowRate || aboveRate < 0.3) return null
    return {
      gasThreshold: medianGas,
      issueRate: Math.round(aboveRate * 100),
    }
  }, [data])

  const filteredData = useMemo(() => {
    if (!data) return { success: [], stunner: [], paralyzer: [] }
    const points = data.blockDifficulty.filter(
      (p) => activeFilter === "all" || p.category === activeFilter
    )
    return {
      success: points.filter((p) => p.category === "success"),
      stunner: points.filter((p) => p.category === "stunner"),
      paralyzer: points.filter((p) => p.category === "paralyzer"),
    }
  }, [data, activeFilter])

  const totalCount = data?.blockDifficulty.length ?? 0

  const filterOptions: { key: FilterCategory; label: string }[] = [
    { key: "all", label: `all (${totalCount})` },
    {
      key: "success",
      label: `success (${categoryCounts.success})`,
    },
    {
      key: "stunner",
      label: `stunners (${categoryCounts.stunner})`,
    },
    {
      key: "paralyzer",
      label: `paralyzers (${categoryCounts.paralyzer})`,
    },
  ]

  return (
    <Card className="flex h-full min-h-80 flex-col">
      <CardHeader>
        <CardTitle className="text-lg">block difficulty distribution</CardTitle>
        <CardDescription>
          gas used vs proving latency — identifying the difficulty frontier
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1">
        {isLoading ? (
          <div className="flex h-[380px] items-center justify-center text-sm text-muted-foreground">
            loading chart data...
          </div>
        ) : !data || data.blockDifficulty.length === 0 ? (
          <div className="flex h-[380px] items-center justify-center text-sm text-muted-foreground">
            no data available
          </div>
        ) : (
          <>
            <div className="mb-3 flex flex-wrap gap-2">
              {filterOptions.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={activeFilter === key}
                  onClick={() => setActiveFilter(key)}
                  className={cn(
                    "rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
                    activeFilter === key
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-foreground/20"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            <ResponsiveContainer width="100%" height={380}>
              <ScatterChart
                margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="gasUsed"
                  type="number"
                  name="gas used"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  tickFormatter={(v: number) => `${(v / 1e6).toFixed(0)}M`}
                  label={{
                    value: "gas used (millions)",
                    position: "insideBottom",
                    offset: -10,
                    fill: "hsl(var(--muted-foreground))",
                    fontSize: 11,
                  }}
                />
                <YAxis
                  dataKey="bestProvingTime"
                  type="number"
                  name="proving time"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  tickFormatter={(v: number) => prettyMs(v)}
                  width={30}
                />
                <ZAxis
                  dataKey="proofCount"
                  type="number"
                  range={[40, 300]}
                  name="proof count"
                />
                <ReferenceLine
                  y={RTP_PERFORMANCE_TIME_THRESHOLD_MS}
                  stroke="hsl(var(--muted-foreground))"
                  strokeDasharray="6 4"
                  strokeWidth={1.5}
                  label={{
                    value: "10s stunner threshold",
                    position: "insideTopRight",
                    fill: "hsl(var(--muted-foreground))",
                    fontSize: 10,
                  }}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ strokeDasharray: "3 3" }}
                />
                {filteredData.success.length > 0 && (
                  <Scatter
                    name="success"
                    data={filteredData.success}
                    fill={CATEGORY_CONFIG.success.color}
                    stroke={CATEGORY_CONFIG.success.color}
                    strokeWidth={2}
                    fillOpacity={0.6}
                  />
                )}
                {filteredData.stunner.length > 0 && (
                  <Scatter
                    name="stunners"
                    data={filteredData.stunner}
                    fill={CATEGORY_CONFIG.stunner.color}
                    stroke={CATEGORY_CONFIG.stunner.color}
                    strokeWidth={2}
                    fillOpacity={0.6}
                  />
                )}
                {filteredData.paralyzer.length > 0 && (
                  <Scatter
                    name="paralyzers"
                    data={filteredData.paralyzer}
                    fill={CATEGORY_CONFIG.paralyzer.color}
                    stroke={CATEGORY_CONFIG.paralyzer.color}
                    strokeWidth={2}
                    fillOpacity={0.6}
                  />
                )}
              </ScatterChart>
            </ResponsiveContainer>
          </>
        )}
        {issuePattern && (
          <div className="mt-4 w-full rounded-lg border border-warning/30 bg-warning/5 px-3 py-2 text-xs">
            <p className="mt-0.5 text-muted-foreground">
              <span className="font-medium text-warning">
                pattern detected:
              </span>{" "}
              high-gas blocks (&gt;
              {(issuePattern.gasThreshold / 1e6).toFixed(0)}M) have a{" "}
              {issuePattern.issueRate}% chance of being stunners or paralyzers.
              consider investigating blocks above the difficulty frontier.
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex-col items-start gap-y-4 border-t pt-6 text-xs text-muted-foreground">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          {(["success", "stunner", "paralyzer"] as const).map((category) => (
            <div key={category} className="flex items-center gap-1.5">
              <span
                className="size-2.5 rounded-full"
                style={{
                  backgroundColor: CATEGORY_CONFIG[category].color,
                }}
              />
              <span>
                {category === "success"
                  ? "<10s success"
                  : category === "stunner"
                    ? "10-19s stunner"
                    : ">19s paralyzer"}
              </span>
            </div>
          ))}
          <span className="text-muted-foreground">
            bubble size = proof count
          </span>
        </div>
        <div className="min-h-14">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-placeholder">key insight:</span>{" "}
            the diagonal pattern shows the &quot;difficulty frontier&quot; — as
            gas increases, latency increases predictably. points above the
            frontier are outliers worth investigating (complex txs,
            precompile-heavy, unusual state access patterns).
          </p>
        </div>
      </CardFooter>
    </Card>
  )
}
