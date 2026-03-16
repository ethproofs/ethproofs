import type { GuestSummaryData } from "@/lib/types"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

import { cn } from "@/lib/utils"

import { formatNumber } from "@/lib/number"

const HEALTHY_THRESHOLD = 50
const WARNING_THRESHOLD = 75

type DiversityStatus = "healthy" | "warning" | "critical"

function getDiversityStatus(dominantShare: number): DiversityStatus {
  if (dominantShare < HEALTHY_THRESHOLD) return "healthy"
  if (dominantShare < WARNING_THRESHOLD) return "warning"
  return "critical"
}

const STATUS_CONFIG: Record<
  DiversityStatus,
  {
    label: string
    cardClassName: string
    contentClassName: string
    dotClassName: string
  }
> = {
  healthy: {
    label: "healthy",
    cardClassName: "border-none bg-success/10",
    contentClassName: "border-success/30 text-success",
    dotClassName: "bg-success",
  },
  warning: {
    label: "warning",
    cardClassName: "border-none bg-warning/10",
    contentClassName: "border-warning/30 text-warning",
    dotClassName: "bg-warning",
  },
  critical: {
    label: "critical",
    cardClassName: "border-none bg-destructive/10",
    contentClassName: "border-destructive/30 text-destructive",
    dotClassName: "bg-destructive",
  },
}

function formatCompact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}m`
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`
  return formatNumber(value)
}

interface GuestSummaryCardsProps {
  data: GuestSummaryData
}

export function GuestSummaryCard({ data }: GuestSummaryCardsProps) {
  const status = getDiversityStatus(data.dominantGuestShare)
  const config = STATUS_CONFIG[status]

  return (
    <Card className={cn("border-none", config.cardClassName)}>
      <CardContent className="flex flex-col gap-6 pt-6 lg:flex-row lg:items-stretch">
        <div className="flex items-center gap-6 lg:flex-1">
          <div
            className={cn(
              "flex flex-col items-center gap-2",
              config.contentClassName
            )}
          >
            <Badge
              variant="outline"
              className={cn(
                "px-3 py-1 text-sm uppercase",
                config.contentClassName
              )}
            >
              <div
                className={cn(
                  "mr-1.5 size-2 rounded-full",
                  config.dotClassName
                )}
              />
              {config.label}
            </Badge>
            <span className="text-xs text-muted-foreground">
              diversity status
            </span>
          </div>

          <div className="hidden w-px self-stretch bg-border lg:block" />

          <div className="flex flex-col items-start gap-2">
            <span className="text-xs text-muted-foreground">
              dominant guest program
            </span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-semibold">
                {data.dominantGuest}
              </span>
              <span
                className={cn("text-xl font-semibold", config.contentClassName)}
              >
                {data.dominantGuestShare.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        <div className="hidden w-px self-stretch bg-border lg:block" />

        <div className="flex items-center gap-3 border-t border-border pt-6 lg:w-72 lg:border-t-0 lg:pt-0">
          <div className="flex flex-1 flex-col gap-1">
            {data.distribution.slice(0, 4).map((entry) => (
              <div key={entry.name} className="flex items-center gap-2 text-xs">
                <span className="w-16 truncate text-muted-foreground">
                  {entry.name}
                </span>
                <div className="h-1.5 flex-1 rounded-full bg-muted">
                  <div
                    className={cn("h-full rounded-full", config.dotClassName)}
                    style={{ width: `${Math.min(entry.share, 100)}%` }}
                  />
                </div>
                <span className="w-10 text-right text-muted-foreground">
                  {entry.share.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="hidden w-px self-stretch bg-border lg:block" />

        <div className="hidden items-center gap-6 lg:flex">
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs text-muted-foreground">active guests</span>
            <span className="text-2xl font-semibold">
              {data.activeGuestsCount}
            </span>
            <span className="text-xs text-muted-foreground">programs</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <span className="text-xs text-muted-foreground">total proofs</span>
            <span className="text-2xl font-semibold">
              {formatCompact(data.totalProofs)}
            </span>
            <span className="text-xs text-muted-foreground">last 7d</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
