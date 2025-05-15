import * as React from "react"

import { cn } from "@/lib/utils"

import { Divider } from "./divider"

type HeroSectionProps = React.HTMLAttributes<HTMLDivElement>

const HeroSection = ({ className, ...props }: HeroSectionProps) => (
  <section
    className={cn(
      "space-y-8 rounded-4xl border bg-gradient-to-b from-primary/[0.02] to-primary/[0.06] p-6 dark:from-white/[0.01] dark:to-white/[0.04] md:p-8",
      className
    )}
    {...props}
  />
)
HeroSection.displayName = "HeroSection"

type HeroTitleProps = React.HTMLAttributes<HTMLDivElement>

const HeroTitle = ({ className, ...props }: HeroTitleProps) => (
  <div className={cn("flex gap-2", className)} {...props} />
)
HeroTitle.displayName = "HeroTitle"

type HeroDividerProps = React.HTMLAttributes<HTMLDivElement>

const HeroDivider = ({ className, ...props }: HeroDividerProps) => (
  <Divider className={cn("my-8", className)} {...props} />
)
HeroDivider.displayName = "HeroDivider"

type HeroBodyProps = React.HTMLAttributes<HTMLDivElement>

const HeroBody = ({ className, ...props }: HeroBodyProps) => (
  <div className={cn("flex flex-wrap gap-x-6 gap-y-4", className)} {...props} />
)
HeroBody.displayName = "HeroBody"

type HeroItemProps = React.HTMLAttributes<HTMLDivElement>

const HeroItem = ({ className, ...props }: HeroItemProps) => (
  <div className={cn("max-w-full space-y-0.5", className)} {...props} />
)
HeroItem.displayName = "HeroItem"

type HeroItemLabelProps = React.HTMLAttributes<HTMLDivElement>

const HeroItemLabel = ({ className, ...props }: HeroItemLabelProps) => (
  <div
    className={cn("flex items-center gap-1 text-body-secondary", className)}
    {...props}
  />
)
HeroItemLabel.displayName = "HeroItemLabel"

export {
  HeroBody,
  HeroDivider,
  HeroItem,
  HeroItemLabel,
  HeroSection,
  HeroTitle,
}
