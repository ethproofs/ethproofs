import { AlertOctagon } from "lucide-react"
import Link from "next/link"

import { Card } from "@/components/ui/card"

import type { MultiClusterMiss } from "@/lib/api/status"

interface MultiClusterMissesSectionProps {
  misses: MultiClusterMiss[]
  totalActiveClusters: number
}

export function MultiClusterMissesSection({
  misses,
  totalActiveClusters,
}: MultiClusterMissesSectionProps) {
  if (misses.length === 0) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium text-destructive">
        <AlertOctagon className="size-4" />
        blocks missed by 3+ clusters ({misses.length})
      </div>
      <p className="text-xs text-muted-foreground">
        these blocks were missed by multiple clusters simultaneously, which may
        indicate a network or systemic issue
      </p>
      <Card className="p-6">
        <div className="flex flex-wrap gap-2">
          {misses.slice(0, 20).map((miss) => (
            <Link
              key={miss.block_number}
              href={`/blocks/${miss.block_number}`}
              className="flex items-center gap-1.5 rounded-sm border border-destructive/20 bg-destructive/5 px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10"
            >
              <span className="font-mono">{miss.block_number}</span>
              <span className="text-xs text-muted-foreground">
                ({miss.clusters_missing}/{totalActiveClusters})
              </span>
            </Link>
          ))}
          {misses.length > 20 && (
            <span className="self-center text-xs text-muted-foreground">
              +{misses.length - 20} more
            </span>
          )}
        </div>
      </Card>
    </div>
  )
}
