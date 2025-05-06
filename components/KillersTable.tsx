import Image from "next/image"

import { cn } from "@/lib/utils"

import { prettyMs } from "@/lib/time"

type Benchmark = {
  nickname: string
  target: string
  description: string
  blockNumber: number
  blockSizeBytes: number
}

const demoBenchmarks: Benchmark[] = [
  {
    nickname: "slayer",
    target: "SHA256",
    description: "",
    blockNumber: 420,
    blockSizeBytes: 32_750,
  },
  {
    nickname: "killer",
    target: "Keccak ",
    description: "",
    blockNumber: 420,
    blockSizeBytes: 32_750,
  },
  {
    nickname: "murderer",
    target: "modexp ",
    description: "",
    blockNumber: 420,
    blockSizeBytes: 32_750,
  },
  {
    nickname: "ripper",
    target: "ecrecover ",
    description: "",
    blockNumber: 420,
    blockSizeBytes: 32_750,
  },
  {
    nickname: "punisher",
    target: "parings ",
    description: "",
    blockNumber: 420,
    blockSizeBytes: 32_750,
  },
]

const CELL_COLOR_CLASSES = {
  red: "border-level-worst from-level-worst/25",
  yellow: "border-level-middle from-level-middle/25",
  green: "border-level-best from-level-best/25",
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
  <div className="flex flex-col px-2">
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
// TODO: Use real data from each cluster machine
const RowItem = ({
  // cluster,
  className,
}: {
  // cluster: Cluster // TODO: Use cluster data
  className?: string
}) => (
  <div
    className={cn("gap-x-4 border-b border-primary/10 px-4 py-6", className)}
  >
    {/* Proving team logo and cluster name */}
    <div className="space-y-2">
      <Image
        src="https://ibkqxhjnroghhtfyualc.supabase.co/storage/v1/object/public/public-assets/succinct-logo.svg"
        alt=""
        className="dark:invert"
        height={24}
        width={24}
        style={{ height: "1.5rem", width: "auto" }}
      />
      <div className="text-primary">snarking beast v1.2</div>
    </div>
    {/* One column per benchmark */}
    {Array.from({ length: demoBenchmarks.length }).map((_, idx) => {
      const timeMs = Math.random() * (5 * 60 * 1000 - 10 * 1000) + 10 * 1000
      const color: Color =
        timeMs < 45 * 1000 ? "green" : timeMs < 90 * 1000 ? "yellow" : "red"

      return (
        <DataCell
          key={idx}
          timeMs={timeMs}
          costUsd={Math.random() * (0.25 - 0.0003) + 0.0003}
          color={color}
        />
      )
    })}
  </div>
)

const KillersTable = () => (
  // TODO: Accept data as props
  <div
    className="grid"
    style={{
      gridTemplateColumns: `1fr repeat(${demoBenchmarks.length}, auto)`,
    }}
  >
    <div className="col-span-full grid grid-cols-subgrid gap-x-12 border-b border-primary py-6">
      <div className="SPACER col-start-1" />

      {demoBenchmarks.map((benchmark) => (
        <div
          key={benchmark.target}
          className="flex flex-col items-center px-2 font-sans"
        >
          <div className="text-center">{benchmark.target}</div>
          <div className="text-center text-level-worst">
            {benchmark.nickname}
          </div>
        </div>
      ))}
    </div>

    {Array.from({ length: 5 }, (_, i) => (
      <RowItem
        key={i}
        className="col-span-full grid grid-cols-subgrid"
        // cluster="TODO"
      />
    ))}
  </div>
)

export default KillersTable
