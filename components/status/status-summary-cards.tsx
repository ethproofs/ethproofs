import { CheckCheck, Layers, Server, TriangleAlert } from "lucide-react"

import { Card, CardContent, CardHeader } from "@/components/ui/card"

import type { MissingProofsStatus } from "@/lib/api/status"

interface StatusSummaryCardsProps {
  data: MissingProofsStatus
}

export function StatusSummaryCards({ data }: StatusSummaryCardsProps) {
  const totalPerfect = data.perfect_by_prover_type.reduce(
    (sum, group) => sum + group.clusters.length,
    0
  )
  const clustersWithIssues = data.total_active_clusters - totalPerfect

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Layers className="size-3.5" />
            blocks monitored
          </span>
        </CardHeader>
        <CardContent>
          <span className="text-2xl font-semibold">
            {data.total_blocks_monitored}
          </span>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CheckCheck className="size-3.5" />
            clusters up to date
          </span>
        </CardHeader>
        <CardContent>
          <span className="text-2xl font-semibold text-primary">
            {totalPerfect}
          </span>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <TriangleAlert className="size-3.5" />
            missing proofs
          </span>
        </CardHeader>
        <CardContent>
          <span
            className={`text-2xl font-semibold ${data.total_missing > 0 ? "text-destructive" : ""}`}
          >
            {data.total_missing}
          </span>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Server className="size-3.5" />
            clusters with issues
          </span>
        </CardHeader>
        <CardContent>
          <span
            className={`text-2xl font-semibold ${clustersWithIssues > 0 ? "text-destructive" : ""}`}
          >
            {clustersWithIssues}
          </span>
        </CardContent>
      </Card>
    </div>
  )
}
