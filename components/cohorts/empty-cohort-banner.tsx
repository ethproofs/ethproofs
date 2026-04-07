import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  month: "short",
  day: "numeric",
}

function formatCohortRange(): string {
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  return `${weekAgo.toLocaleDateString("en-US", DATE_FORMAT)} \u2013 ${now.toLocaleDateString("en-US", DATE_FORMAT)}`
}

export function EmptyCohortBanner() {
  return (
    <Card className="border-none bg-warning/10">
      <CardContent className="flex items-stretch gap-6 pt-6">
        <div className="flex flex-col items-center justify-center gap-2">
          <Badge
            variant="outline"
            className="whitespace-nowrap px-3 py-1 text-sm text-warning"
          >
            <div className="mr-1.5 size-2 rounded-full bg-warning" />
            no cohort
          </Badge>
          <span className="text-xs text-muted-foreground">
            {formatCohortRange()}
          </span>
        </div>
        <div className="w-px self-stretch bg-border" />
        <div className="flex flex-col justify-center gap-1">
          <span className="text-sm font-medium">
            <span className="sm:hidden">no provers eligible</span>
            <span className="hidden sm:inline">
              no provers are eligible for this cohort this week
            </span>
          </span>
          <span className="text-xs text-muted-foreground">
            <span className="sm:hidden">provers must hit score targets</span>
            <span className="hidden sm:inline">
              provers must meet all requirements and hit score targets to be
              included in the cohort
            </span>
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
