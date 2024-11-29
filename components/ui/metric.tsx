import React from "react"

import InfoCircle from "@/components/svgs/info-circle.svg"
import Tooltip from "@/components/Tooltip"

import { cn } from "@/lib/utils"

const MetricBox = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("space-y-0.5 px-2 py-3", className)}
    {...props}
  />
))
MetricBox.displayName = "MetricBox"

const MetricLabel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm lowercase text-body-secondary", className)}
    {...props}
  />
))
MetricLabel.displayName = "MetricLabel"

type MetricInfoProps = React.HTMLAttributes<HTMLDivElement> & {
  trigger?: React.ReactNode
}
const MetricInfo = React.forwardRef<HTMLDivElement, MetricInfoProps>(
  ({ trigger, className, children, ...props }, ref) => (
    <Tooltip
      trigger={
        <div className="ms-2">
          {trigger || <InfoCircle className="-mb-0.5" />}
        </div>
      }
      className="max-w-80 sm:max-w-96"
    >
      <div
        ref={ref}
        className={cn("space-y-2 text-start", className)}
        {...props}
      >
        {children}
      </div>
    </Tooltip>
  )
)
MetricInfo.displayName = "MetricInfo"

const MetricValue = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("font-mono text-2xl font-semibold", className)}
    {...props}
  />
))
MetricValue.displayName = "MetricValue"

export { MetricBox, MetricInfo, MetricLabel, MetricValue }
