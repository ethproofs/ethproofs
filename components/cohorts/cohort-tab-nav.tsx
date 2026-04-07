"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { cn } from "@/lib/utils"

interface CohortTab {
  href: string
  label: string
  isDisabled?: boolean
  disabledReason?: string
}

interface CohortTabNavProps {
  hasOppCohort: boolean
}

export function CohortTabNav({ hasOppCohort }: CohortTabNavProps) {
  const pathname = usePathname()

  const tabs: CohortTab[] = [
    { href: "/", label: "RTP cohort" },
    {
      href: "/on-prem-proving-initiative",
      label: "1:10 cohort",
      ...(!hasOppCohort && {
        isDisabled: true,
        disabledReason: "coming soon",
      }),
    },
  ]

  return (
    <nav className="flex min-h-10 w-full flex-wrap items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href
        const isDisabled = tab.isDisabled ?? false

        const tabElement = isDisabled ? (
          <span
            key={tab.href}
            className="inline-flex flex-1 items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium opacity-50"
          >
            {tab.label}
          </span>
        ) : (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "inline-flex flex-1 items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              isActive
                ? "bg-background text-foreground shadow-sm"
                : "hover:text-foreground/80"
            )}
          >
            {tab.label}
          </Link>
        )

        if (!isDisabled) return tabElement

        return (
          <TooltipProvider key={tab.href} delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>{tabElement}</TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs">
                  {tab.disabledReason ?? "no data available"}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      })}
    </nav>
  )
}
