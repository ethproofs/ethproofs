import React from "react"

import InfoCircle from "@/components/svgs/info-circle.svg"

import { cn } from "@/lib/utils"

import { Popover, PopoverContent, PopoverTrigger } from "./popover"

type MetricBoxProps = React.HTMLAttributes<HTMLDivElement>

const MetricBox = ({ className, ...props }: MetricBoxProps) => (
  <div className={cn("space-y-0.5 px-2 py-3", className)} {...props} />
)
MetricBox.displayName = "MetricBox"

type MetricLabelProps = React.HTMLAttributes<HTMLDivElement>

const MetricLabel = ({ className, ...props }: MetricLabelProps) => (
  <div
    className={cn("text-sm lowercase text-body-secondary", className)}
    {...props}
  />
)
MetricLabel.displayName = "MetricLabel"

type MetricInfoProps = React.HTMLAttributes<HTMLDivElement> & {
  label?: React.ReactNode
  trigger?: React.ReactNode
}

const MetricInfo = ({
  label,
  trigger,
  className,
  children,
  ...props
}: MetricInfoProps) => (
  <Popover>
    <PopoverTrigger className="hover:animate-pulse">
      {trigger || (
        <div className="flex items-center gap-2">
          <span className="text-nowrap text-start">{label}</span>
          <InfoCircle className="-mb-0.5 shrink-0" />
        </div>
      )}
    </PopoverTrigger>
    <PopoverContent className="max-w-80 sm:max-w-96">
      <div className={cn("space-y-2 text-start", className)} {...props}>
        {children}
      </div>
    </PopoverContent>
  </Popover>
)
MetricInfo.displayName = "MetricInfo"

type MetricValueProps = React.HTMLAttributes<HTMLDivElement>

const MetricValue = ({ className, ...props }: MetricValueProps) => (
  <div
    className={cn("font-mono text-2xl font-semibold", className)}
    {...props}
  />
)
MetricValue.displayName = "MetricValue"

export { MetricBox, MetricInfo, MetricLabel, MetricValue }
