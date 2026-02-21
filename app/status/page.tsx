import { CheckCheck, TriangleAlert } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"

import { Card } from "@/components/ui/card"

import { fetchMissingProofsStatus } from "@/lib/api/status"
import { getMetadata } from "@/lib/metadata"

export const metadata: Metadata = getMetadata({
  title: "Proof Status Monitor",
  description: "Monitor missing proof submissions across all active clusters",
})

export default async function StatusPage() {
  const statusData = await fetchMissingProofsStatus()

  const hasIssues = statusData.total_missing > 0
  const totalPerfect = statusData.perfect_by_prover_type.reduce(
    (sum, group) => sum + group.clusters.length,
    0
  )
  const hasPerfectClusters = totalPerfect > 0
  const checkedAt = new Date(statusData.checked_at)
  const timeRangeStart = new Date(statusData.time_range.start)
  const timeRangeEnd = new Date(statusData.time_range.end)

  return (
    <>
      <h1 className="mb-10 mt-16 px-6 text-center text-3xl font-semibold md:mt-24 md:px-8">
        proof status monitor
      </h1>

      <div className="mx-auto max-w-screen-lg px-6 md:px-8">
        <Card className="mb-10 p-6">
          <div className="text-center">
            <h2 className="mb-4 text-xl font-semibold">current status</h2>

            <div className="mb-4 text-sm text-body-secondary">
              <div>
                checked at: {checkedAt.toLocaleString()} (
                {Intl.DateTimeFormat().resolvedOptions().timeZone})
              </div>
              <div>
                monitoring last 6 hours: {timeRangeStart.toLocaleString()} →{" "}
                {timeRangeEnd.toLocaleString()}
              </div>
              {statusData.total_block_range.start &&
                statusData.total_block_range.end && (
                  <div>
                    block range: #{statusData.total_block_range.start} - #
                    {statusData.total_block_range.end}
                  </div>
                )}
            </div>

            {!hasIssues && (
              <div className="flex items-center justify-center gap-2 text-lg font-semibold text-primary">
                <CheckCheck className="size-5" />
                all clusters are up to date
              </div>
            )}
          </div>
        </Card>

        {hasPerfectClusters && hasIssues && (
          <div className="mb-10 space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold text-primary">
              <CheckCheck className="size-5" />
              clusters up to date - [{totalPerfect}]
            </div>
            {statusData.perfect_by_prover_type.map((group) => (
              <div key={group.prover_type_id}>
                <h3 className="mb-2 text-sm font-medium text-body-secondary">
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
                      <span className="ml-1 text-xs text-body-secondary">
                        ({cluster.team_name})
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {hasIssues && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold text-destructive">
              <TriangleAlert className="size-5" />
              missing proofs - [{statusData.total_missing}]
            </div>
            {statusData.missing_by_prover_type.map((group) => (
              <div key={group.prover_type_id} className="space-y-4">
                <h3 className="text-sm font-medium text-body-secondary">
                  {group.prover_type_name.toLowerCase()}
                </h3>
                {group.teams.map((team) => (
                  <Card key={team.team_id} className="p-6">
                    <div>
                      <Link
                        href={`/teams/${team.team_slug}`}
                        className="text-lg text-destructive hover:text-destructive/70"
                      >
                        {team.team_name}
                      </Link>
                    </div>

                    <div className="mt-2 space-y-3">
                      {team.clusters.map((cluster) => (
                        <div
                          key={cluster.cluster_id}
                          className="rounded-sm border-l-4 border-destructive bg-secondary p-2"
                        >
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/clusters/${cluster.cluster_id}`}
                              className="text-destructive hover:text-destructive/70 hover:underline"
                            >
                              {cluster.cluster_name}
                            </Link>
                          </div>

                          <div className="text-sm text-body">
                            missing proofs for blocks:{" "}
                            {cluster.missing_blocks
                              .slice(0, 5)
                              .map((blockNum, index) => (
                                <span key={blockNum}>
                                  <Link
                                    href={`/blocks/${blockNum}`}
                                    className="text-sm text-destructive hover:text-destructive/70"
                                  >
                                    {blockNum}
                                  </Link>
                                  {index <
                                    Math.min(
                                      4,
                                      cluster.missing_blocks.length - 1
                                    ) && ", "}
                                </span>
                              ))}
                            {cluster.missing_blocks.length > 5 && (
                              <span className="text-body-secondary">
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

            <div className="mt-8 text-center text-sm text-body-secondary">
              confirm your prover is online and submitting proofs
            </div>
          </div>
        )}
      </div>
    </>
  )
}
