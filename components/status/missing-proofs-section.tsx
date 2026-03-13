import { TriangleAlert } from "lucide-react"
import Link from "next/link"

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
      <div className="flex items-center gap-2 text-sm font-medium text-destructive">
        <TriangleAlert className="size-4" />
        missing proofs ({totalMissing})
      </div>
      {groups.map((group) => (
        <div key={group.prover_type_id} className="space-y-4">
          <h3 className="text-xs font-medium text-muted-foreground">
            {group.prover_type_name.toLowerCase()}
          </h3>
          {group.teams.map((team) => (
            <Card key={team.team_id} className="p-6">
              <Link
                href={`/teams/${team.team_slug}`}
                className="text-base font-medium text-destructive hover:text-destructive/70"
              >
                {team.team_name}
              </Link>
              <div className="mt-3 space-y-3">
                {team.clusters.map((cluster) => (
                  <div
                    key={cluster.cluster_id}
                    className="rounded-sm border-l-4 border-destructive bg-secondary p-3"
                  >
                    <Link
                      href={`/clusters/${cluster.cluster_id}`}
                      className="text-sm text-destructive hover:text-destructive/70 hover:underline"
                    >
                      {cluster.cluster_name}
                    </Link>
                    <div className="mt-1 text-sm text-muted-foreground">
                      missing proofs for blocks:{" "}
                      {cluster.missing_blocks.slice(0, 5).map((blockNum, i) => (
                        <span key={blockNum}>
                          <Link
                            href={`/blocks/${blockNum}`}
                            className="text-sm text-destructive hover:text-destructive/70"
                          >
                            {blockNum}
                          </Link>
                          {i <
                            Math.min(4, cluster.missing_blocks.length - 1) &&
                            ", "}
                        </span>
                      ))}
                      {cluster.missing_blocks.length > 5 && (
                        <span className="text-muted-foreground">
                          {" "}
                          +{cluster.missing_blocks.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      ))}
    </div>
  )
}
