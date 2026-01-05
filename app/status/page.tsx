import { CheckCheck, TriangleAlert } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"

import { Alert } from "@/components/ui/alert"
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
  const checkedAt = new Date(statusData.checked_at)
  const timeRangeStart = new Date(statusData.time_range.start)
  const timeRangeEnd = new Date(statusData.time_range.end)

  return (
    <>
      <h1 className="mb-12 mt-16 px-6 text-center text-3xl font-semibold md:mt-24 md:px-8">
        proof status monitor
      </h1>

      <div className="mx-auto max-w-screen-lg px-6 md:px-8">
        {/* Summary Card */}
        <Card className="mb-8 p-6">
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

            {hasIssues ? (
              <Alert className="mb-4" variant="destructive">
                <div className="flex items-center justify-center gap-2 text-lg font-semibold text-destructive">
                  <TriangleAlert className="size-5" />{" "}
                  {statusData.total_missing} missing proofs detected
                </div>
              </Alert>
            ) : (
              <div className="flex items-center justify-center gap-2 text-lg font-semibold text-primary">
                <CheckCheck className="size-5" />
                all clusters are up to date
              </div>
            )}
          </div>
        </Card>
        {/* Missing Proofs Details */}
        {hasIssues && (
          <div className="space-y-6">
            {statusData.teams.map((team) => (
              <Card key={team.team_id} className="p-6">
                <div>
                  <Link
                    href={`/teams/${team.team_slug}`}
                    className="text-lg text-primary hover:text-primary-light"
                  >
                    {team.team_name}
                  </Link>
                </div>

                <div className="mt-2 space-y-3">
                  {team.clusters.map((cluster) => (
                    <div
                      key={cluster.cluster_id}
                      className="rounded-sm border-l-4 border-primary bg-secondary p-2"
                    >
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/clusters/${cluster.cluster_id}`}
                          className="text-primary hover:text-primary-light hover:underline"
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
                                className="text-sm text-primary hover:text-primary-light"
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

            <div className="mt-8 text-center text-sm text-body-secondary">
              confirm your prover is online and submitting proofs for every 100
              blocks
            </div>
          </div>
        )}
      </div>
    </>
  )
}
