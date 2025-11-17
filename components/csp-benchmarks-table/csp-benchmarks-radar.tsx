"use client"

import { useMemo, useState } from "react"
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts"

import { Card, CardContent } from "@/components/ui/card"
import { ChartConfig, ChartContainer } from "@/components/ui/chart"

import { CHART_COLORS, getProverKey, RADAR_METRICS } from "./utils"

import { Metrics } from "@/lib/api/csp-benchmarks"

interface CspBenchmarksRadarProps {
  benchmarks: Metrics[]
}

const normalizeValue = (value: number, min: number, max: number): number => {
  if (max === min) return 50
  return 100 - ((value - min) / (max - min)) * 100
}

const calculateMedian = (values: number[]): number => {
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid]
}

interface CustomTickProps {
  payload: { value: string }
  x: number
  y: number
  textAnchor: "start" | "middle" | "end"
}

const CustomTick = ({ payload, x, y, textAnchor }: CustomTickProps) => {
  const words = payload.value.split(" ")
  const lineHeight = 12
  const fontSize = 11

  // Adjust position based on location
  let xOffset = 0
  let yOffset = 0

  if (textAnchor === "start") {
    // Left side - push slightly right
    xOffset = 5
  } else if (textAnchor === "end") {
    // Right side - push slightly left
    xOffset = -5
  } else if (textAnchor === "middle") {
    // Top/bottom - add vertical offset
    yOffset = y < 200 ? -5 : 5
  }

  return (
    <g transform={`translate(${x + xOffset},${y + yOffset})`}>
      {words.map((word: string, index: number) => (
        <text
          key={index}
          x={0}
          y={index * lineHeight - ((words.length - 1) * lineHeight) / 2}
          textAnchor={textAnchor}
          fill="hsl(var(--muted-foreground))"
          fontSize={fontSize}
        >
          {word}
        </text>
      ))}
    </g>
  )
}

export function CspBenchmarksRadar({ benchmarks }: CspBenchmarksRadarProps) {
  const [hoveredProver, setHoveredProver] = useState<string | null>(null)

  const { chartConfig, allProvers } = useMemo(() => {
    if (benchmarks.length === 0) {
      return { chartConfig: {}, allProvers: [] }
    }

    const proverSet = new Set<string>()
    benchmarks.forEach((benchmark) => {
      proverSet.add(getProverKey(benchmark))
    })

    const allKeys = Array.from(proverSet).sort()
    const config = allKeys.reduce(
      (acc, key, index) => {
        acc[key] = {
          label: key,
          color: CHART_COLORS[index % CHART_COLORS.length],
        }
        return acc
      },
      {} as Record<string, { label: string; color: string }>
    )

    return { chartConfig: config, allProvers: allKeys }
  }, [benchmarks])

  const normalizedChartData = useMemo(() => {
    if (benchmarks.length === 0) return []

    // Group ALL benchmarks by prover
    const proverGroups = new Map<string, Metrics[]>()
    benchmarks.forEach((benchmark) => {
      const key = getProverKey(benchmark)
      if (!proverGroups.has(key)) {
        proverGroups.set(key, [])
      }
      proverGroups.get(key)?.push(benchmark)
    })

    // Calculate median for each prover and metric
    const aggregatedResults = new Map<string, Record<string, number>>()

    proverGroups.forEach((benchmarks, proverKey) => {
      const results: Record<string, number> = {}

      RADAR_METRICS.forEach((metric) => {
        const values = benchmarks
          .map((b) => b[metric.key])
          .filter((v): v is number => typeof v === "number")

        if (values.length > 0) {
          results[metric.key] = calculateMedian(values)
        }
      })

      aggregatedResults.set(proverKey, results)
    })

    const allResults = Array.from(aggregatedResults.entries())

    if (allResults.length === 0) return []

    // Calculate min/max for normalization
    const metricRanges = RADAR_METRICS.reduce(
      (acc, metric) => {
        const values = allResults
          .map(([_, results]) => results[metric.key])
          .filter((v): v is number => typeof v === "number")

        if (values.length > 0) {
          acc[metric.key] = {
            min: Math.min(...values),
            max: Math.max(...values),
          }
        }
        return acc
      },
      {} as Record<string, { min: number; max: number }>
    )

    // Build normalized chart data
    return RADAR_METRICS.map((metric) => {
      const dataPoint: Record<string, string | number> = {
        metric: metric.label,
      }
      const range = metricRanges[metric.key]

      if (range) {
        allResults.forEach(([proverKey, results]) => {
          const value = results[metric.key]
          if (typeof value === "number") {
            dataPoint[proverKey] = normalizeValue(value, range.min, range.max)
          }
        })
      }

      return dataPoint
    })
  }, [benchmarks])

  if (normalizedChartData.length === 0) {
    return (
      <Card className="w-full space-y-4">
        <CardContent className="flex h-[400px] items-center justify-center">
          <p className="text-sm text-muted-foreground">
            no benchmark data available
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full space-y-4">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center gap-4 md:gap-6">
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square w-full max-w-[500px] md:max-w-[800px]"
          >
            <RadarChart
              data={normalizedChartData}
              margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <PolarAngleAxis dataKey="metric" tick={CustomTick} />
              <PolarGrid />
              {allProvers.map((key) => {
                const isHovered = hoveredProver === key
                const isDimmed = hoveredProver !== null && !isHovered
                return (
                  <Radar
                    key={key}
                    dataKey={key}
                    fill={chartConfig[key].color}
                    fillOpacity={isDimmed ? 0.1 : isHovered ? 0.7 : 0.5}
                    stroke={chartConfig[key].color}
                    strokeOpacity={isDimmed ? 0.1 : 1}
                    strokeWidth={isHovered ? 3 : 2}
                    style={{ transition: "all 0.2s ease" }}
                  />
                )
              })}
            </RadarChart>
          </ChartContainer>

          <div className="flex flex-wrap justify-center gap-1.5 md:gap-2">
            {allProvers.map((key) => {
              const isHovered = hoveredProver === key
              const isDimmed = hoveredProver !== null && !isHovered
              return (
                <div
                  key={key}
                  className="flex cursor-pointer items-center gap-1.5 px-1.5 py-0.5 text-xs transition-opacity md:gap-2 md:px-2 md:py-1 md:text-sm"
                  style={{ opacity: isDimmed ? 0.4 : 1 }}
                  onMouseEnter={() => setHoveredProver(key)}
                  onMouseLeave={() => setHoveredProver(null)}
                >
                  <div
                    className="h-2.5 w-2.5 shrink-0 rounded-sm md:h-3 md:w-3"
                    style={{ backgroundColor: chartConfig[key].color }}
                  />
                  <span className="whitespace-nowrap">{key}</span>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
