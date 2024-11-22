import React from "react"

import InfoCircle from "@/components/svgs/info-circle.svg"

import { cn } from "@/lib/utils"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip"

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

const MetricInfo = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger className="ms-2">
        <InfoCircle className="-mb-0.5" />
      </TooltipTrigger>
      <TooltipContent className="max-w-80 sm:max-w-96">
        <div
          ref={ref}
          className={cn("space-y-2 text-start", className)}
          {...props}
        >
          {children}
        </div>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
))
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
