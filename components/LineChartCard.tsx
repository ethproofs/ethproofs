"use client"

import * as React from "react"
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"

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

import { cn } from "@/lib/utils"

import { Button } from "./ui/button"

// TODO: Use real data
const chartData = Array(400)
  .fill(0)
  .map((_, i) => {
    const randAdjust1 = Math.random() - 0.5
    const randAdjust2 = Math.random() - 0.5
    const date = new Date()
    date.setDate(date.getDate() - i)

    return {
      date: date.toISOString().split("T")[0],
      avg: i + randAdjust1,
      median: i + randAdjust2,
    }
  })

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

type LineChartProps = {
  title: string
}

type DayRange = 7 | 30 | 90 | 365

const LineChartCard = ({ title }: LineChartProps) => {
  const [dayRange, setDayRange] = React.useState<DayRange>(7)

  const setTimeRangeValue = (value: DayRange) => () => setDayRange(value)

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date)
    const referenceDate = new Date()
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - dayRange - 1)
    return date >= startDate
  })

  return (
    <Card className="border-1 relative overflow-hidden dark:bg-black/10">
      <CardHeader className="flex flex-col gap-2 space-y-0 py-5">
        <CardTitle>{title}</CardTitle>
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
              stroke="hsla(var(--c1hart-border))"
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
            <Line
              dataKey="avg"
              type="monotone"
              stroke="hsla(var(--chart-1))"
              strokeWidth={2}
              dot
            />
            <Line
              dataKey="median"
              type="monotone"
              stroke="hsla(var(--chart-2))"
              strokeWidth={2}
              dot
            />
            <ChartLegend
              content={<ChartLegendContent />}
              className="font-sans text-xs"
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-fit flex-nowrap items-center gap-x-1 rounded-full bg-background-highlight px-1 py-1">
          <Button
            onClick={setTimeRangeValue(7)}
            className={cn(
              "text-nowrap rounded-full px-2 py-0 font-sans text-xs font-bold uppercase text-body-secondary",
              dayRange === 7 && "bg-background-active text-primary"
            )}
            variant="ghost"
          >
            7 days
          </Button>
          <Button
            onClick={setTimeRangeValue(30)}
            className={cn(
              "text-nowrap rounded-full px-2 py-0 font-sans text-xs font-bold uppercase text-body-secondary",
              dayRange === 30 && "bg-background-active text-primary"
            )}
            variant="ghost"
          >
            30 days
          </Button>
          <Button
            onClick={setTimeRangeValue(90)}
            className={cn(
              "text-nowrap rounded-full px-2 py-0 font-sans text-xs font-bold uppercase text-body-secondary",
              dayRange === 90 && "bg-background-active text-primary"
            )}
            variant="ghost"
          >
            90 days
          </Button>
          <Button
            onClick={setTimeRangeValue(365)}
            className={cn(
              "text-nowrap rounded-full px-2 py-0 font-sans text-xs font-bold uppercase text-body-secondary",
              dayRange === 365 && "bg-background-active text-primary"
            )}
            variant="ghost"
          >
            365 days
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

export default LineChartCard
