import { AlertOctagon, ChevronRight } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

import type { MultiClusterMiss } from "@/lib/api/status"

interface BlocksMissedSectionProps {
  misses: MultiClusterMiss[]
  totalActiveClusters: number
}

export function BlocksMissedSection({
  misses,
  totalActiveClusters,
}: BlocksMissedSectionProps) {
  const sorted = [...misses].sort(
    (a, b) => b.clusters_missing - a.clusters_missing
  )

  return (
    <div className="space-y-4">
      <span className="text-lg font-semibold">
        blocks missed by 3+ provers ({misses.length})
      </span>
      {sorted.length === 0 ? (
        <Card className="px-4 py-6 text-center text-sm text-muted-foreground">
          no blocks missed by multiple provers
        </Card>
      ) : (
        <Card className="divide-y divide-border">
          {sorted.map((miss) => (
            <Link
              key={miss.block_number}
              href={`/blocks/${miss.block_number}`}
              className="flex items-center gap-4 bg-destructive/10 px-4 py-3 transition-colors hover:bg-destructive/20"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-destructive/20">
                <AlertOctagon className="size-4 text-destructive" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate font-mono text-sm font-medium">
                    block #{miss.block_number}
                  </span>
                  <Badge className="shrink-0 rounded-sm bg-destructive/10 text-destructive">
                    {miss.clusters_missing} / {totalActiveClusters} missed
                  </Badge>
                </div>
                <div className="mt-0.5 text-sm text-muted-foreground">
                  missed by {miss.clusters_missing} prover
                  {miss.clusters_missing !== 1 ? "s" : ""} — possible issue to
                  investigate
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {miss.cluster_names.map((name) => (
                    <Badge
                      key={name}
                      variant="outline"
                      className="text-muted-foreground"
                    >
                      {name}
                    </Badge>
                  ))}
                </div>
              </div>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
            </Link>
          ))}
        </Card>
      )}
    </div>
  )
}
