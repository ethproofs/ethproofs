import type { LucideIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

import { cn } from "@/lib/utils"

interface MetricCardProps {
  label: string
  value: string
  icon?: LucideIcon
  valueClassName?: string
  change?: number
  tag?: string
  isIncreasePositive?: boolean
}

export function MetricCard({
  label,
  value,
  icon: Icon,
  valueClassName,
  change,
  tag,
  isIncreasePositive = false,
}: MetricCardProps) {
  const hasChange = change !== undefined && change !== 0
  const isPositiveChange = hasChange && change > 0
  const isGoodChange = isIncreasePositive ? isPositiveChange : !isPositiveChange

  return (
    <Card>
      <CardHeader className="pb-2">
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {Icon && <Icon className="size-3.5" />}
          {label}
        </span>
      </CardHeader>
      <CardContent className="flex items-end justify-between gap-2">
        <span className={cn("text-2xl font-semibold", valueClassName)}>
          {value}
        </span>
        <div className="hidden items-center gap-1 2xl:flex">
          {tag && (
            <Badge variant="outline" className="bg-muted-foreground/50">
              {tag}
            </Badge>
          )}
          {hasChange && (
            <Badge
              variant="outline"
              className={
                isGoodChange
                  ? "border-success/30 text-success"
                  : "border-destructive/30 text-destructive"
              }
            >
              {isPositiveChange ? "\u25B2" : "\u25BC"}{" "}
              {Math.abs(change).toFixed(1)}%
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
