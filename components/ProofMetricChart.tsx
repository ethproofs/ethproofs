"use client"

import { useMemo, useState } from "react"
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import type { DayRange } from "@/lib/types"

import { Button } from "@/components/ui/button"

import { cn } from "@/lib/utils"

import { CHART_RANGES } from "@/lib/constants"

export type ChartData = {
  date: string
  avg: number
  median: number
}

interface ProofMetricChartProps {
  title: string
  data: ChartData[]
  isLoading?: boolean
  totalAvg: number
  totalMedian: number
  formatValue?: (value: number | string | (number | string)[]) => string
  hideKPIs?: boolean
  initialDayRange?: DayRange
}

const filterData = (data: ChartData[], dayRange: DayRange) => {
  return data.filter((item) => {
    const date = new Date(item.date)
    const referenceDate = new Date()
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - dayRange - 1)
    return date >= startDate
  })
}

export function ProofMetricChart({
  title,
  data,
  isLoading = false,
  totalAvg,
  totalMedian,
  formatValue,
  hideKPIs = false,
  initialDayRange = CHART_RANGES[1],
}: ProofMetricChartProps) {
  const [dayRange, setDayRange] = useState<DayRange>(initialDayRange)
  const [lineVisibility, setLineVisibility] = useState<{
    avg: boolean
    median: boolean
  }>({
    avg: true,
    median: true,
  })

  const filteredData = useMemo(
    () => filterData(data, dayRange),
    [data, dayRange]
  )

  const toggleLineVisibility = (key: "avg" | "median") => {
    setLineVisibility((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="w-full space-y-4 rounded-lg border bg-card p-4">
      {/* Title */}
      <div className="text-center">
        <h3 className="text-2xl font-semibold capitalize">{title}</h3>
      </div>

      {/* KPIs */}
      {!hideKPIs && (
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center rounded-lg border bg-background p-4">
            <span className="text-xs font-medium text-muted-foreground">
              Average
            </span>
            <span className="mt-2 text-2xl font-semibold text-primary">
              {formatValue ? formatValue(totalAvg) : totalAvg}
            </span>
          </div>
          <div className="flex flex-col items-center rounded-lg border bg-background p-4">
            <span className="text-xs font-medium text-muted-foreground">
              Median
            </span>
            <span className="mt-2 text-2xl font-semibold text-primary">
              {formatValue ? formatValue(totalMedian) : totalMedian}
            </span>
          </div>
        </div>
      )}

      {/* Chart */}
      {isLoading ? (
        <div className="flex h-[300px] items-center justify-center text-muted-foreground">
          Loading chart data...
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={filteredData}
              margin={{ top: 5, right: 20, left: 40, bottom: 30 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--chart-border))"
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                }}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  if (typeof value === "number" && formatValue) {
                    return formatValue(value)
                  }
                  return String(value)
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "calc(var(--radius) - 2px)",
                  color: "hsl(var(--foreground))",
                  fontSize: 12,
                  padding: "8px 12px",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                }}
                labelFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                }}
                formatter={(value) => {
                  if (typeof value === "number" && formatValue) {
                    return formatValue(value)
                  }
                  return String(value)
                }}
              />
              {lineVisibility.avg && (
                <Line
                  dataKey="avg"
                  type="monotone"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                  name="Average"
                />
              )}
              {lineVisibility.median && (
                <Line
                  dataKey="median"
                  type="monotone"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                  name="Median"
                />
              )}
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: "16px" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        {/* Line Visibility Toggle */}
        <div className="flex gap-2">
          <Button
            variant={lineVisibility.avg ? "default" : "outline"}
            size="sm"
            className="h-8 px-2 text-xs sm:px-3"
            onClick={() => toggleLineVisibility("avg")}
          >
            Avg
          </Button>
          <Button
            variant={lineVisibility.median ? "default" : "outline"}
            size="sm"
            className="h-8 px-2 text-xs sm:px-3"
            onClick={() => toggleLineVisibility("median")}
          >
            Med
          </Button>
        </div>

        {/* Day Range Selector */}
        <div className="flex flex-wrap gap-1 rounded-lg bg-background p-1">
          {CHART_RANGES.map((range) => (
            <Button
              key={range}
              onClick={() => setDayRange(range)}
              className={cn(
                "h-8 rounded-md px-2 text-xs font-medium transition-colors sm:px-3",
                dayRange === range
                  ? "bg-primary text-primary-foreground"
                  : "bg-transparent text-muted-foreground hover:text-foreground"
              )}
              variant="ghost"
            >
              {range}d
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
