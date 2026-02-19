import { AlertTriangle } from "lucide-react"

import GitHubLogo from "@/components/svgs/github-logo.svg"
import Timestamp from "@/components/Timestamp"
import { Card, CardContent } from "@/components/ui/card"
import Link from "@/components/ui/link"

const benchmarkMachine = {
  host: "AWS mac2.metal",
  cpu: "Apple M1, 8 cores",
  ram: "16 GB",
  os: "macOS (arm64)",
} as const

const benchmarksRepoUrl = new URL(
  "privacy-ethereum/csp-benchmarks",
  "https://github.com/"
).toString()

interface BenchmarkContextProps {
  lastUpdated: string | null
  failedCount: number
}

export function BenchmarkContext({
  lastUpdated,
  failedCount,
}: BenchmarkContextProps) {
  return (
    <div className="flex flex-col gap-4 px-4 sm:px-6">
      {failedCount > 0 && (
        <div className="flex items-center gap-2 rounded-md border border-level-worst/30 bg-level-worst/10 px-4 py-3 text-sm text-level-worst">
          <AlertTriangle className="size-4 shrink-0" />
          <span>
            {failedCount} benchmark file{failedCount > 1 ? "s" : ""} failed
            validation and could not be loaded
          </span>
        </div>
      )}

      <Card>
        <CardContent className="flex flex-col gap-4 p-4">
          <div className="grid grid-cols-2 gap-4 text-center text-sm sm:grid-cols-4">
            <div>
              <div className="text-body-secondary">host</div>
              <div className="font-medium">{benchmarkMachine.host}</div>
            </div>
            <div>
              <div className="text-body-secondary">cpu</div>
              <div className="font-medium">{benchmarkMachine.cpu}</div>
            </div>
            <div>
              <div className="text-body-secondary">ram</div>
              <div className="font-medium">{benchmarkMachine.ram}</div>
            </div>
            <div>
              <div className="text-body-secondary">os</div>
              <div className="font-medium">{benchmarkMachine.os}</div>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            {lastUpdated && (
              <span className="text-body-secondary">
                last updated: <Timestamp>{lastUpdated}</Timestamp>
              </span>
            )}

            <Link
              hideArrow
              href={benchmarksRepoUrl}
              aria-label="GitHub repository"
              className="ml-auto"
            >
              <GitHubLogo className="size-5 text-foreground" />
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
