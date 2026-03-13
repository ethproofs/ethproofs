import { CheckCheck } from "lucide-react"
import Link from "next/link"

import type { PerfectProverTypeGroup } from "@/lib/api/status"

interface UpToDateClustersSectionProps {
  groups: PerfectProverTypeGroup[]
}

export function UpToDateClustersSection({
  groups,
}: UpToDateClustersSectionProps) {
  const totalPerfect = groups.reduce(
    (sum, group) => sum + group.clusters.length,
    0
  )

  if (totalPerfect === 0) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium text-primary">
        <CheckCheck className="size-4" />
        clusters up to date ({totalPerfect})
      </div>
      {groups.map((group) => (
        <div key={group.prover_type_id}>
          <h3 className="mb-2 text-xs font-medium text-muted-foreground">
            {group.prover_type_name.toLowerCase()}
          </h3>
          <div className="flex flex-wrap gap-2">
            {group.clusters.map((cluster) => (
              <Link
                key={cluster.cluster_id}
                href={`/clusters/${cluster.cluster_id}`}
                className="rounded-sm border border-primary/20 bg-primary/5 px-3 py-1.5 text-sm text-primary hover:bg-primary/10"
              >
                {cluster.cluster_name}
                <span className="ml-1 text-xs text-muted-foreground">
                  ({cluster.team_name})
                </span>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
