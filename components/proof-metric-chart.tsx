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
} from "recharts"

import type { DayRange } from "@/lib/types"

import { Button } from "@/components/ui/button"

import { CHART_RANGES } from "@/lib/constants"

export type ChartData = {
  date: string
  avg: number
  median: number
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
        <h3 className="text-2xl font-semibold">{title}</h3>
      </div>

      {/* KPIs */}
      {!hideKPIs && (
        <div className="flex flex-1">
          <div className="flex flex-1 flex-col items-center border-e p-4 text-center">
            <span className="text-xs font-medium text-muted-foreground">
              average
            </span>
            <span className="mt-2 text-2xl font-semibold text-primary">
              {formatValue ? formatValue(totalAvg) : totalAvg}
            </span>
          </div>
          <div className="flex flex-1 flex-col items-center p-4">
            <span className="text-xs font-medium text-muted-foreground">
              median
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
          loading chart data...
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={filteredData}
              margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
            >
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                stroke="hsl(var(--chart-border))"
              />
              <XAxis
                dataKey="date"
                tickLine
                axisLine
                tickMargin={6}
                minTickGap={40}
                fontSize={12}
                style={{ textTransform: "lowercase" }}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
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
                  textTransform: "lowercase",
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
                  stroke="hsl(var(--chart-9))"
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                  name="average"
                />
              )}
              {lineVisibility.median && (
                <Line
                  dataKey="median"
                  type="monotone"
                  stroke="hsl(var(--chart-12))"
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                  name="median"
                />
              )}
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: "16px" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-row items-center justify-between gap-4">
        <div className="flex gap-2">
          <Button
            variant={lineVisibility.avg ? "secondary" : "ghost"}
            size="sm"
            className="h-8 text-xs"
            onClick={() => toggleLineVisibility("avg")}
          >
            average
          </Button>
          <Button
            variant={lineVisibility.median ? "secondary" : "ghost"}
            size="sm"
            className="h-8 text-xs"
            onClick={() => toggleLineVisibility("median")}
          >
            median
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 rounded-lg bg-background p-1">
          {CHART_RANGES.map((range) => (
            <Button
              key={range}
              onClick={() => setDayRange(range)}
              size="sm"
              variant={dayRange === range ? "secondary" : "ghost"}
              className="aspect-square h-9 w-9"
            >
              {range}d
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
