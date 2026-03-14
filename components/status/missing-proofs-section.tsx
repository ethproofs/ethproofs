import { ChevronRight, TriangleAlert } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

import type { ProverTypeGroup } from "@/lib/api/status"

interface MissingProofsSectionProps {
  groups: ProverTypeGroup[]
  totalMissing: number
}

export function MissingProofsSection({
  groups,
  totalMissing,
}: MissingProofsSectionProps) {
  if (totalMissing === 0) return null

  return (
    <div className="space-y-4">
      <span className="text-lg font-semibold">
        missing proofs ({totalMissing})
      </span>
      {groups.map((group) => (
        <div key={group.prover_type_id} className="space-y-2">
          <h3 className="text-xs font-medium text-muted-foreground">
            {group.prover_type_name.toLowerCase()}
          </h3>
          <Card className="divide-y divide-border">
            {group.teams.flatMap((team) =>
              team.clusters.map((cluster) => (
                <Link
                  key={cluster.cluster_id}
                  href={`/clusters/${cluster.cluster_id}`}
                  className="flex items-center gap-4 bg-destructive/10 px-4 py-3 transition-colors hover:bg-destructive/20"
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-destructive/20">
                    <TriangleAlert className="size-4 text-destructive" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium">
                        {cluster.cluster_name}
                      </span>
                      <Badge className="shrink-0 rounded-sm bg-destructive/10 text-destructive">
                        {cluster.missing_blocks.length} missing
                      </Badge>
                    </div>
                    <div className="mt-0.5 text-sm text-muted-foreground">
                      prover missed:{" "}
                      {cluster.missing_blocks.slice(0, 5).map((blockNum, i) => (
                        <span key={blockNum}>
                          #{blockNum}
                          {i < Math.min(4, cluster.missing_blocks.length - 1) &&
                            ", "}
                        </span>
                      ))}
                      {cluster.missing_blocks.length > 5 && (
                        <span> +{cluster.missing_blocks.length - 5} more</span>
                      )}
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      <Badge
                        variant="outline"
                        className="text-muted-foreground"
                      >
                        {team.team_name}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-muted-foreground"
                      >
                        {cluster.cluster_name}
                      </Badge>
                    </div>
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                </Link>
              ))
            )}
          </Card>
        </div>
      ))}
    </div>
  )
}
