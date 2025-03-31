import { Fragment } from "react"

import * as Info from "@/components/ui/info"

import { cn } from "@/lib/utils"

import { MetricInfo } from "./ui/metric"
import { TooltipContentHeader } from "./ui/tooltip"
import StatusIcon from "./StatusIcon"

type ProofStatus = "proved" | "proving" | "queued"

const ORDERED_STATUSES = ["proved", "proving", "queued"] as const

const DESCRIPTIONS = {
  proved: "Completed proofs published",
  proving: "Current proofs in progress",
  queued: "Queued for proving",
} as Record<(typeof ORDERED_STATUSES)[number], string>

export const ProofStatusInfo = ({ title }: { title?: string }) => (
  <>
    <TooltipContentHeader>{title ?? "proof status"}</TooltipContentHeader>
    <div className="items-top grid grid-cols-[auto,1fr] gap-4">
      {ORDERED_STATUSES.map((status) => (
        <Fragment key={status}>
          <StatusIcon status={status} />
          {DESCRIPTIONS[status]}
        </Fragment>
      ))}
    </div>
    <Info.Description>Current status of proofs</Info.Description>
  </>
)

type ProofStatusProps = React.HTMLAttributes<HTMLDivElement> & {
  statusCount: Record<ProofStatus, number>
  hideEmpty?: boolean
}
const ProofStatus = ({
  statusCount,
  className,
  hideEmpty = true,
  ...props
}: ProofStatusProps) => {
  return (
    <figure
      className={cn("flex items-center gap-4 font-mono", className)}
      {...props}
    >
      {ORDERED_STATUSES.map((status) => {
        const count = statusCount[status] ?? 0
        // Hide if no proofs for that status
        if (count === 0 && hideEmpty) return null
        return (
          <div key={status} className="flex items-center gap-1">
            <MetricInfo
              trigger={
                <div className="flex flex-nowrap items-center gap-1">
                  <StatusIcon status={status} />
                  <span className="block">{count}</span>
                </div>
              }
            >
              <span className="!font-body text-body">
                {DESCRIPTIONS[status]}
              </span>
            </MetricInfo>
          </div>
        )
      })}
    </figure>
  )
}

export default ProofStatus
