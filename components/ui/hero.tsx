import * as React from "react"

import { cn } from "@/lib/utils"

const HeroSection = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <section
    ref={ref}
    className={cn(
      "space-y-8 rounded-4xl border bg-gradient-to-b from-primary/[0.02] to-primary/[0.06] px-2 py-6 dark:from-white/[0.01] dark:to-white/[0.04] md:p-8",
      className
    )}
    {...props}
  />
))
HeroSection.displayName = "HeroSection"

const HeroTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex gap-2", className)} {...props} />
))
HeroTitle.displayName = "HeroTitle"

const HeroDivider = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("my-8 h-px w-full bg-gradient-to-r from-primary", className)}
    {...props}
  />
))
HeroDivider.displayName = "HeroDivider"

const HeroBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-wrap gap-x-6 gap-y-4", className)}
    {...props}
  />
))
HeroBody.displayName = "HeroBody"

const HeroItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("space-y-0.5 max-w-full", className)} {...props} />
))
HeroItem.displayName = "HeroItem"

const HeroItemLabel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center gap-1 text-body-secondary", className)}
    {...props}
  />
))
HeroItemLabel.displayName = "HeroItemLabel"

export {
  HeroBody,
  HeroDivider,
  HeroItem,
  HeroItemLabel,
  HeroSection,
  HeroTitle,
}
