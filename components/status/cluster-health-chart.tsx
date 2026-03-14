import { groupBy, pipe, sortBy } from "remeda"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import type { PerfectProverTypeGroup, ProverTypeGroup } from "@/lib/api/status"

interface ClusterEntry {
  clusterName: string
  teamName: string
  proverType: string
  isHealthy: boolean
  missingCount: number
}

function deriveGroupedEntries(
  perfect: PerfectProverTypeGroup[],
  missing: ProverTypeGroup[]
): Record<string, ClusterEntry[]> {
  const entries: ClusterEntry[] = []

  for (const group of perfect) {
    for (const cluster of group.clusters) {
      entries.push({
        clusterName: cluster.cluster_name,
        teamName: cluster.team_name,
        proverType: group.prover_type_name.toLowerCase(),
        isHealthy: true,
        missingCount: 0,
      })
    }
  }

  for (const group of missing) {
    for (const team of group.teams) {
      for (const cluster of team.clusters) {
        entries.push({
          clusterName: cluster.cluster_name,
          teamName: team.team_name,
          proverType: group.prover_type_name.toLowerCase(),
          isHealthy: false,
          missingCount: cluster.missing_blocks.length,
        })
      }
    }
  }

  return pipe(
    entries,
    sortBy(
      (e) => e.proverType,
      (e) => (e.isHealthy ? 0 : 1),
      (e) => e.clusterName
    ),
    groupBy((e) => e.proverType)
  )
}

interface ClusterHealthChartProps {
  perfect: PerfectProverTypeGroup[]
  missing: ProverTypeGroup[]
  totalBlocksMonitored: number
  totalMissing: number
  blockRange: { start: number | null; end: number | null }
}

export function ClusterHealthChart({
  perfect,
  missing,
  totalBlocksMonitored,
  totalMissing,
  blockRange,
}: ClusterHealthChartProps) {
  const grouped = deriveGroupedEntries(perfect, missing)
  const proverTypes = Object.keys(grouped)

  if (proverTypes.length === 0) return null

  const allEntries = proverTypes.flatMap((pt) => grouped[pt])
  const healthyCount = allEntries.filter((e) => e.isHealthy).length
  const issueCount = allEntries.length - healthyCount

  return (
    <Card className="flex flex-col">
      <CardHeader className="space-y-1.5">
        <CardTitle className="text-lg">prover health</CardTitle>
        <CardDescription>
          monitoring every 100th block from the last 6 hours
          {blockRange.start && blockRange.end && (
            <span>
              {" "}
              &middot; block range #{blockRange.start} - #{blockRange.end}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg bg-muted/50 px-3 py-2">
            <div className="text-xs text-muted-foreground">
              blocks monitored
            </div>
            <div className="font-mono text-sm font-semibold">
              {totalBlocksMonitored}
            </div>
          </div>
          <div className="rounded-lg bg-muted/50 px-3 py-2">
            <div className="text-xs text-muted-foreground">up to date</div>
            <div className="font-mono text-sm font-semibold text-primary">
              {healthyCount}
            </div>
          </div>
          <div className="rounded-lg bg-muted/50 px-3 py-2">
            <div className="text-xs text-muted-foreground">missing proofs</div>
            <div
              className={`font-mono text-sm font-semibold ${totalMissing > 0 ? "text-destructive" : ""}`}
            >
              {totalMissing}
            </div>
          </div>
          <div className="rounded-lg bg-muted/50 px-3 py-2">
            <div className="text-xs text-muted-foreground">with issues</div>
            <div
              className={`font-mono text-sm font-semibold ${issueCount > 0 ? "text-destructive" : ""}`}
            >
              {issueCount}
            </div>
          </div>
        </div>
        <div className="space-y-4">
          {proverTypes.map((proverType) => (
            <div key={proverType}>
              <div className="mb-1 text-xs font-medium text-muted-foreground">
                {proverType}
              </div>
              <div className="space-y-0">
                {grouped[proverType].map((entry) => (
                  <div
                    key={`${entry.proverType}-${entry.clusterName}`}
                    className="flex items-center gap-4 border-b border-border/40 py-1 last:border-b-0"
                  >
                    <div className="w-36 shrink-0 truncate text-xs">
                      {entry.clusterName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {entry.teamName}
                    </div>
                    <div className="ml-auto flex justify-center">
                      <span
                        className={`inline-block size-2.5 rounded-full ${entry.isHealthy ? "bg-primary" : "bg-destructive"}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start gap-y-4 border-t pt-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-primary" />
            <span>up to date</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-destructive" />
            <span>missing proofs</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
