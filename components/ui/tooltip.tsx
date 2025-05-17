"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

import { cn } from "@/lib/utils"

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

type TooltipContentHeaderProps = React.HTMLAttributes<HTMLDivElement>

const TooltipContentHeader = ({
  className,
  ...props
}: TooltipContentHeaderProps) => (
  <div
    className={cn("pb-2 text-lg font-bold text-body", className)}
    {...props}
  />
)
TooltipContentHeader.displayName = "TooltipContentHeader"

type TooltipContentFooterProps = React.HTMLAttributes<HTMLDivElement>

const TooltipContentFooter = ({
  className,
  ...props
}: TooltipContentFooterProps) => (
  <div
    className={cn(
      "!mt-4 border-t border-body-secondary pt-2 text-body-secondary",
      className
    )}
    {...props}
  />
)
TooltipContentFooter.displayName = "TooltipContentFooter"

type TooltipContentProps = React.ComponentProps<typeof TooltipPrimitive.Content>

const TooltipContent = ({
  className,
  sideOffset = 4,
  ...props
}: TooltipContentProps) => (
  <TooltipPrimitive.Content
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-md border bg-background-highlight px-3 py-1.5 text-sm text-body shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
)
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export {
  Tooltip,
  TooltipContent,
  TooltipContentFooter,
  TooltipContentHeader,
  TooltipProvider,
  TooltipTrigger,
}
