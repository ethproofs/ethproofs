import Image from "next/image"

import { Benchmark, ClusterBase, ClusterBenchmark, Team } from "@/lib/types"

import { cn } from "@/lib/utils"

import Link from "./ui/link"

import { getBenchmarkColor } from "@/lib/benchmarks"
import { prettyMs } from "@/lib/time"

const CELL_COLOR_CLASSES = {
  red: "border-level-worst dark:from-level-worst/20 from-level-worst/10",
  yellow: "border-level-middle from-level-middle/10",
  green: "border-level-best from-level-best/10",
  none: "border-transparent",
} as const

type Color = keyof typeof CELL_COLOR_CLASSES

type BenchmarkItemProps = {
  timeMs?: number
  costUsd?: number
  color?: Color
}

const DataCell = ({ timeMs, costUsd, color }: BenchmarkItemProps) => (
  // TODO: Add Popover for remaining details of benchmark block
  <div className="flex flex-col">
    <div
      className={cn(
        "rounded-sm border-b bg-gradient-to-t text-center",
        "font-mono text-sm",
        CELL_COLOR_CLASSES[color || "none"]
      )}
    >
      {timeMs ? prettyMs(timeMs) : "Soon"}
    </div>
    <div className="text-center font-sans text-xs text-body-secondary">
      {costUsd
        ? new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 3,
            minimumFractionDigits: 2,
          }).format(costUsd)
        : "no data yet"}
    </div>
  </div>
)

type ClusterBenchmarkItem = ClusterBase & {
  benchmarks: ClusterBenchmark[]
  team: Team
}

const RowItem = ({
  className,
  cluster,
  benchmarks,
}: {
  className?: string
  cluster: ClusterBenchmarkItem
  benchmarks: Benchmark[]
}) => (
  <div
    className={cn("gap-x-10 border-b border-primary/10 px-4 py-6", className)}
  >
    {/* Proving team logo and cluster name */}
    <div className="space-y-2 text-nowrap">
      <Link
        href={`/teams/${cluster.team.id}`}
        className="-m-2 block w-fit rounded p-2 hover:bg-primary/10"
      >
        {cluster.team.logo_url ? (
          <Image
            src={cluster.team.logo_url}
            alt={`${cluster.team.name} team logo`}
            height={24}
            width={24}
            className="dark:invert"
            style={{ height: "1.5rem", width: "auto" }}
          />
        ) : (
          cluster.team.name
        )}
      </Link>
      <Link
        href={`/clusters/${cluster.id}`}
        className="block font-sans text-primary hover:underline"
      >
        {cluster.nickname}
      </Link>
    </div>
    {/* One column per benchmark */}
    {Array.from({ length: benchmarks.length }).map((_, idx) => {
      const benchmark = cluster.benchmarks.find(
        (benchmark) => benchmark.benchmark_id === benchmarks[idx].id
      )

      const timeMs = benchmark?.time_ms
      const costUsd = benchmark?.cost_usd

      const color = getBenchmarkColor(timeMs)

      return (
        <DataCell key={idx} timeMs={timeMs} costUsd={costUsd} color={color} />
      )
    })}
  </div>
)

const KillersTable = ({
  benchmarks,
  clusters,
}: {
  benchmarks: Benchmark[]
  clusters: ClusterBenchmarkItem[]
}) => (
  <div
    className="-me-6 grid overflow-x-auto pe-6 md:-me-8 md:pe-8"
    style={{
      gridTemplateColumns: `1fr repeat(${benchmarks.length}, 8rem)`,
    }}
  >
    <div className="col-span-full grid grid-cols-subgrid border-b border-primary py-6">
      <div className="SPACER col-start-1" />

      {benchmarks.map((benchmark) => (
        <div
          key={benchmark.id}
          className="flex flex-col items-center font-sans"
        >
          <div className="text-center">{benchmark.operation_type}</div>
          <div className="text-center text-level-worst">
            {benchmark.display_name}
          </div>
        </div>
      ))}
    </div>

    {clusters.map((cluster) => (
      <RowItem
        key={cluster.id}
        cluster={cluster}
        benchmarks={benchmarks}
        className="col-span-full grid grid-cols-subgrid"
      />
    ))}
  </div>
)

export default KillersTable
