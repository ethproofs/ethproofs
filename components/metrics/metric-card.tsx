import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

interface MetricCardProps {
  label: string
  value: string
  change?: number
  tag?: string
  isIncreasePositive?: boolean
}

export function MetricCard({
  label,
  value,
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
        <span className="text-xs text-muted-foreground">{label}</span>
      </CardHeader>
      <CardContent className="flex items-end justify-between gap-2">
        <span className="text-2xl font-semibold">{value}</span>
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
                  ? "border-green-500/30 text-green-500"
                  : "border-red-500/30 text-red-500"
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
