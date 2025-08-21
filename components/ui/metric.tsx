import React from "react"
import { Info } from "lucide-react"

import { cn } from "@/lib/utils"

import { Popover, PopoverContent, PopoverTrigger } from "./popover"

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
  label?: React.ReactNode
  trigger?: React.ReactNode
}
const MetricInfo = React.forwardRef<HTMLDivElement, MetricInfoProps>(
  ({ label, trigger, className, children, ...props }, ref) => (
    <Popover>
      <PopoverTrigger className="hover:animate-pulse">
        {trigger || (
          <div className="flex items-center gap-2">
            <span className="text-nowrap text-start">{label}</span>
            <Info className="-mb-0.5 size-3 shrink-0" />
          </div>
        )}
      </PopoverTrigger>
      <PopoverContent className="max-w-80 sm:max-w-96">
        <div
          ref={ref}
          className={cn("space-y-2 text-start", className)}
          {...props}
        >
          {children}
        </div>
      </PopoverContent>
    </Popover>
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
