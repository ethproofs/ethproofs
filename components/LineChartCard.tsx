"use client"

import * as React from "react"
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"

import type { DayRange } from "@/lib/types"

import ArrowDropdown from "@/components/svgs/arrow-dropdown.svg"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { cn } from "@/lib/utils"

import { CHART_RANGES } from "@/lib/constants"

import { Button } from "./ui/button"

import { formatUsd } from "@/lib/number"
import { prettyMs } from "@/lib/time"

const chartConfig = {
  avg: {
    label: "avg",
    color: "hsl(var(--chart-1))",
  },
  median: {
    label: "median",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

type LineKey = "avg" | "median"

type ChartFormat = "currency" | "ms"

export type ChartData = {
  date: string
  avg: number
  median: number
}

type ChartCardProps = {
  title: string
  format: "currency" | "ms"
  data: ChartData[]
  initialDayRange?: DayRange
}

const formatValue = (value: number | string, format: ChartFormat) => {
  const numValue = typeof value === "string" ? parseFloat(value) : value

  if (isNaN(numValue)) {
    return "-"
  }

  if (format === "currency") {
    return formatUsd(numValue)
  }

  if (format === "ms") {
    return prettyMs(numValue)
  }
}

// TODO: to be removed
const getLatestValues = (data: ChartData[]) => {
  if (!data.length) {
    return { avg: 0, median: 0 }
  }

  // data is sorted by date asc
  return data[data.length - 1]
}

const LineChartCard = ({
  title,
  format,
  data,
  initialDayRange = CHART_RANGES[0],
}: ChartCardProps) => {
  const [dayRange, setDayRange] = React.useState<DayRange>(initialDayRange)
  const [lineVisibility, setLineVisibility] = React.useState<{
    [key in LineKey]: boolean
  }>({
    avg: true,
    median: true,
  })

  const setTimeRangeValue = (value: DayRange) => () => setDayRange(value)

  const latestValues = getLatestValues(data)

  const toggleLineVisibility = (key: LineKey) => {
    setLineVisibility((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const filteredData = data.filter((item) => {
    const date = new Date(item.date)
    const referenceDate = new Date()
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - dayRange - 1)
    return date >= startDate
  })

  return (
    <Card className="border-1 relative space-y-4 overflow-hidden dark:bg-black/10 md:space-y-4">
      <CardHeader className="flex flex-col gap-6 space-y-0 py-5">
        <CardTitle className="text-lg font-normal">{title}</CardTitle>
        <div className="flex">
          <div className="flex flex-1 flex-col items-center border-e text-center">
            <span className="block text-sm font-bold uppercase">avg</span>
            <span className="block font-mono text-3xl text-primary">
              {/* TODO: replace this with total avg once we have the data */}
              {formatValue(latestValues.avg, format)}
            </span>
          </div>
          <div className="flex flex-1 flex-col items-center text-center">
            <span className="block text-sm font-bold uppercase">median</span>
            <span className="block font-mono text-3xl text-primary">
              {/* TODO: replace this with total median once we have the data */}
              {formatValue(latestValues.median, format)}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <LineChart
            accessibilityLayer
            data={filteredData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid
              vertical={false}
              horizontal
              stroke="hsla(var(--chart-border))"
            />
            <XAxis
              dataKey="date"
              tickLine
              axisLine
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  }}
                />
              }
            />
            {lineVisibility.avg && (
              <Line
                dataKey="avg"
                type="monotone"
                stroke="hsla(var(--chart-1))"
                strokeWidth={2}
                dot={false}
              />
            )}
            {lineVisibility.median && (
              <Line
                dataKey="median"
                type="monotone"
                stroke="hsla(var(--chart-2))"
                strokeWidth={2}
                dot={false}
              />
            )}
            <ChartLegend
              content={<ChartLegendContent />}
              className="font-sans text-xs"
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="group flex h-6 w-fit items-center gap-2 rounded-full border bg-background-highlight px-2 py-1.5 text-sm text-body hover:bg-primary-light hover:text-background [&[data-state=open]]:bg-primary-light [&[data-state=open]]:text-background">
              Options
              <ArrowDropdown className="transition-transform duration-100 group-[&[data-state=open]]:-scale-y-100" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent>
            <DropdownMenuCheckboxItem
              className="text-primary"
              checked={lineVisibility.avg}
              onCheckedChange={() => toggleLineVisibility("avg")}
            >
              Average
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={lineVisibility.median}
              onCheckedChange={() => toggleLineVisibility("median")}
            >
              Median
            </DropdownMenuCheckboxItem>
            {/* <DropdownMenuSeparator /> */}
            {/* // TODO: Add individual teams */}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="mx-auto flex w-fit flex-wrap items-center justify-center gap-x-1 gap-y-2 rounded-xl bg-background-highlight px-1 py-1">
          {CHART_RANGES.map((range) => (
            <Button
              key={range}
              onClick={setTimeRangeValue(range)}
              className={cn(
                "text-nowrap rounded-full px-2 py-0 font-sans text-xs font-bold uppercase text-body-secondary",
                dayRange === range && "bg-background-active text-primary"
              )}
              variant="ghost"
            >
              {range} days
            </Button>
          ))}
        </div>
      </CardFooter>
    </Card>
  )
}

export default LineChartCard
