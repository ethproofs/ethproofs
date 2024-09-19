"use client"

import { Line, LineChart } from "recharts"

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { cn } from "@/lib/utils"
import { HTMLAttributes } from "react"

const defaultChartConfig = {
  value: {
    color: "hsla(var(--chart-1))",
  },
} satisfies ChartConfig

type BasicLineProps = HTMLAttributes<HTMLDivElement> & {
  chartData: { value: number }[]
  chartConfig?: ChartConfig
}

const BasicLine = ({
  className,
  chartData,
  chartConfig = defaultChartConfig,
}: BasicLineProps) => (
  <ChartContainer
    config={chartConfig}
    className={cn("min-h-[100px] w-full", className)}
  >
    <LineChart accessibilityLayer data={chartData}>
      <Line
        dataKey="value"
        stroke="var(--color-value)"
        radius={4}
        dot={false}
        strokeWidth={2}
        type="natural"
      />
      <ChartTooltip content={<ChartTooltipContent />} />
    </LineChart>
  </ChartContainer>
)

export default BasicLine
