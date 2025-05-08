"use client"

import * as React from "react"
import { useMemo } from "react"
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

const chartConfig = {
  avg: {
    label: "avg",
  },
  median: {
    label: "median",
  },
} satisfies ChartConfig

type LineKey = "avg" | "median"

export type ChartData = {
  date: string
  avg: number
  median: number
}

type ChartCardProps = React.HTMLAttributes<HTMLDivElement> & {
  title: string
  format: "currency" | "ms"
  data: ChartData[]
  initialDayRange?: DayRange
  isLoading?: boolean
  totalAvg: number
  totalMedian: number
  formatValue?: (value: number | string | (number | string)[]) => string
  hideKPIs?: boolean
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

const LineChartCard = ({
  className,
  title,
  data,
  initialDayRange = CHART_RANGES[0],
  isLoading = false,
  totalAvg,
  totalMedian,
  formatValue,
  hideKPIs,
}: ChartCardProps) => {
  const [dayRange, setDayRange] = React.useState<DayRange>(initialDayRange)
  const [lineVisibility, setLineVisibility] = React.useState<{
    [key in LineKey]: boolean
  }>({
    avg: true,
    median: true,
  })

  const setTimeRangeValue = (value: DayRange) => () => setDayRange(value)

  const filteredData = useMemo(
    () => filterData(data, dayRange),
    [data, dayRange]
  )

  const toggleLineVisibility = (key: LineKey) => {
    setLineVisibility((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <Card
      className={cn(
        "border-1 relative space-y-4 overflow-hidden md:space-y-4",
        className
      )}
    >
      <CardHeader className="flex flex-col gap-6 space-y-0 py-5">
        <CardTitle className="text-center text-2xl font-normal">
          {title}
        </CardTitle>
        {!hideKPIs && (
          <div className="flex">
            <div className="flex flex-1 flex-col items-center border-e text-center">
              <span className="block text-sm font-bold uppercase">avg</span>
              <span className="block font-mono text-2xl text-primary sm:text-3xl md:text-2xl xl:text-3xl">
                {formatValue ? formatValue(totalAvg) : totalAvg}
              </span>
            </div>
            <div className="flex flex-1 flex-col items-center text-center">
              <span className="block text-sm font-bold uppercase">median</span>
              <span className="block font-mono text-2xl text-primary sm:text-3xl md:text-2xl xl:text-3xl">
                {formatValue ? formatValue(totalMedian) : totalMedian}
              </span>
            </div>
          </div>
        )}{" "}
      </CardHeader>
      <CardContent className="relative">
        {isLoading ? (
          <div className="aspect-auto h-[250px] w-full">
            <div className="absolute inset-0 flex h-[calc(250px-60px)] w-full items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-primary" />
            </div>
          </div>
        ) : (
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
                    valueFormatter={formatValue}
                  />
                }
              />
              {lineVisibility.avg && (
                <Line
                  dataKey="avg"
                  type="monotone"
                  stroke="hsla(var(--chart-2))"
                  strokeWidth={2}
                  dot={false}
                />
              )}
              {lineVisibility.median && (
                <Line
                  dataKey="median"
                  type="monotone"
                  stroke="hsla(var(--chart-3))"
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
        )}
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
