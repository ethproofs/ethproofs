"use client"

import { useMemo, useState } from "react"
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart } from "recharts"

import { ChartContainer } from "@/components/ui/chart"

import { buildChartConfig, getProverKey, type MetricKey, radarMetrics } from "./metrics"
import { ChartLegend, EmptyState, useSeriesSelection } from "./shared"

import type { Metrics } from "@/lib/api/csp-benchmarks"

const minValidMetricsForRadar = radarMetrics.length

interface PercentileEntry {
  key: string
  value: number
}

function computePercentileRanks(
  entries: PercentileEntry[]
): Map<string, number> {
  if (entries.length <= 1) {
    const result = new Map<string, number>()
    entries.forEach((e) => result.set(e.key, 50))
    return result
  }

  const sorted = [...entries].sort((a, b) => a.value - b.value)
  const n = sorted.length

  const ranks = new Map<string, number>()
  let tieStart = 0
  while (tieStart < n) {
    let tieEnd = tieStart
    while (tieEnd < n && sorted[tieEnd].value === sorted[tieStart].value) {
      tieEnd++
    }
    const avgRank = (tieStart + 1 + tieEnd) / 2
    for (let tieIndex = tieStart; tieIndex < tieEnd; tieIndex++) {
      ranks.set(sorted[tieIndex].key, avgRank)
    }
    tieStart = tieEnd
  }

  const result = new Map<string, number>()
  ranks.forEach((rank, key) => {
    result.set(key, (100 * (n - rank)) / (n - 1))
  })
  return result
}

function aggregateRadarScores(
  benchmarks: Metrics[]
): Map<string, Partial<Record<MetricKey, number>>> {
  const cells = new Map<string, Metrics[]>()
  benchmarks.forEach((b) => {
    const cellKey = `${b.target}\0${b.input_size}`
    const existing = cells.get(cellKey)
    if (existing) {
      existing.push(b)
    } else {
      cells.set(cellKey, [b])
    }
  })

  const proverCircuitData = new Map<
    string,
    Map<string, Map<string, number[]>>
  >()

  cells.forEach((cellBenchmarks) => {
    const target = cellBenchmarks[0]?.target
    if (!target) return

    radarMetrics.forEach(({ key: metric }) => {
      const entries: PercentileEntry[] = []
      cellBenchmarks.forEach((b) => {
        const value = b[metric]
        if (typeof value === "number" && value > 0) {
          entries.push({ key: getProverKey(b), value })
        }
      })
      if (entries.length === 0) return

      const percentiles = computePercentileRanks(entries)
      percentiles.forEach((pct, prover) => {
        let circuits = proverCircuitData.get(prover)
        if (!circuits) {
          circuits = new Map()
          proverCircuitData.set(prover, circuits)
        }
        let metricData = circuits.get(target)
        if (!metricData) {
          metricData = new Map()
          circuits.set(target, metricData)
        }
        let values = metricData.get(metric)
        if (!values) {
          values = []
          metricData.set(metric, values)
        }
        values.push(pct)
      })
    })
  })

  const finalScores = new Map<string, Partial<Record<MetricKey, number>>>()

  proverCircuitData.forEach((circuits, prover) => {
    const scores: Partial<Record<MetricKey, number>> = {}

    radarMetrics.forEach(({ key: metric }) => {
      const circuitAvgs: number[] = []
      circuits.forEach((metricData) => {
        const values = metricData.get(metric)
        if (values && values.length > 0) {
          const avg = values.reduce((sum, v) => sum + v, 0) / values.length
          circuitAvgs.push(avg)
        }
      })
      if (circuitAvgs.length > 0) {
        scores[metric] =
          circuitAvgs.reduce((sum, v) => sum + v, 0) / circuitAvgs.length
      }
    })

    const validMetricCount = Object.keys(scores).length
    if (validMetricCount >= minValidMetricsForRadar) {
      finalScores.set(prover, scores)
    }
  })

  return finalScores
}

interface RadarComparisonProps {
  benchmarks: Metrics[]
}

interface CustomTickProps {
  payload: { value: string }
  x: number
  y: number
  cx: number
  cy: number
  textAnchor: "start" | "middle" | "end"
}

const tickOffset = 10
const tickDeadZone = 10
const tickLineHeight = 15
const tickFontSize = 12

function CustomTick({ payload, x, y, cx, cy, textAnchor }: CustomTickProps) {
  const words = payload.value.split(" ")

  const dx = x - cx
  const dy = y - cy

  let xOffset = 0
  let yOffset = 0

  if (textAnchor === "start") {
    xOffset = tickOffset
  } else if (textAnchor === "end") {
    xOffset = -tickOffset
  }

  if (dy < -tickDeadZone) {
    yOffset = -tickOffset
  } else if (dy > tickDeadZone) {
    yOffset = tickOffset
  }

  if (Math.abs(dx) < tickDeadZone) {
    xOffset = 0
  }

  return (
    <g transform={`translate(${x + xOffset},${y + yOffset})`}>
      {words.map((word: string, index: number) => (
        <text
          key={index}
          x={0}
          y={index * tickLineHeight - ((words.length - 1) * tickLineHeight) / 2}
          textAnchor={textAnchor}
          fill="hsl(var(--foreground))"
          fontSize={tickFontSize}
        >
          {word}
        </text>
      ))}
    </g>
  )
}

export function RadarComparison({ benchmarks }: RadarComparisonProps) {
  const [hoveredProver, setHoveredProver] = useState<string | null>(null)

  const scores = useMemo(
    () => aggregateRadarScores(benchmarks),
    [benchmarks]
  )

  const allProvers = useMemo(
    () => Array.from(scores.keys()).sort(),
    [scores]
  )

  const { hidden: hiddenProvers, onToggle: handleToggleProver } = useSeriesSelection(allProvers)

  const chartConfig = useMemo(
    () => buildChartConfig(allProvers),
    [allProvers]
  )

  const chartData = useMemo(() => {
    return radarMetrics.map((metric) => {
      const dataPoint: Record<string, string | number> = {
        metric: metric.label,
      }
      allProvers.forEach((prover) => {
        const score = scores.get(prover)?.[metric.key]
        if (typeof score === "number") {
          dataPoint[prover] = score
        }
      })
      return dataPoint
    })
  }, [scores, allProvers])

  const visibleProvers = useMemo(
    () => allProvers.filter((p) => !hiddenProvers.has(p)),
    [allProvers, hiddenProvers]
  )

  if (benchmarks.length === 0 || chartData.length === 0) {
    return <EmptyState message="no benchmark data available" />
  }

  if (allProvers.length <= 1) {
    return <EmptyState message="comparison requires at least two proving systems" />
  }

  const activeHover = hoveredProver !== null && !hiddenProvers.has(hoveredProver) ? hoveredProver : null
  const hasHover = activeHover !== null

  return (
    <div className="flex flex-col items-center gap-4 md:gap-6" aria-label="aggregated performance comparison">
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square w-full max-w-[400px] overflow-hidden sm:max-w-[500px] md:max-w-[700px]"
      >
        <RadarChart
          accessibilityLayer
          data={chartData}
          margin={{ top: 30, right: 50, bottom: 30, left: 50 }}
        >
          <PolarAngleAxis dataKey="metric" tick={CustomTick} />
          <PolarGrid />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
          {visibleProvers.map((key) => {
            const isHovered = activeHover === key
            return (
              <Radar
                key={key}
                dataKey={key}
                fill={chartConfig[key]?.color}
                fillOpacity={isHovered ? 0.7 : hasHover ? 0.08 : 0.5}
                stroke={chartConfig[key]?.color}
                strokeOpacity={isHovered ? 1 : hasHover ? 0.15 : 1}
                strokeWidth={isHovered ? 2.5 : 1.5}
                isAnimationActive={false}
              />
            )
          })}
        </RadarChart>
      </ChartContainer>
      <ChartLegend
        keys={allProvers}
        chartConfig={chartConfig}
        hiddenKeys={hiddenProvers}
        onToggle={handleToggleProver}
        onHover={setHoveredProver}
        className="w-full"
      />
    </div>
  )
}
