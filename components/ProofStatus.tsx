import { Fragment } from "react"

import type { Proof } from "@/lib/types"

import * as Info from "@/components/ui/info"

import { cn } from "@/lib/utils"

import { MetricInfo } from "./ui/metric"
import { TooltipContentHeader } from "./ui/tooltip"
import StatusIcon from "./StatusIcon"

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
  proofs: Proof[]
  hideEmpty?: boolean
}
const ProofStatus = ({
  proofs,
  className,
  hideEmpty,
  ...props
}: ProofStatusProps) => {
  const allProofs: Proof[][] = Array(ORDERED_STATUSES.length)
    .fill(0)
    .map((_, i) => proofs.filter((p) => p.proof_status === ORDERED_STATUSES[i]))

  return (
    <figure
      className={cn("flex items-center gap-4 font-mono", className)}
      {...props}
    >
      {allProofs.map(({ length: proofCount }, idx) => {
        if (proofCount === 0 && hideEmpty) return null
        return (
          <div key={ORDERED_STATUSES[idx]} className="flex items-center gap-1">
            <MetricInfo
              trigger={
                <div className="flex flex-nowrap items-center gap-1">
                  <StatusIcon status={ORDERED_STATUSES[idx]} />
                  <span className="block">{proofCount}</span>
                </div>
              }
            >
              <span className="!font-body text-body">
                {DESCRIPTIONS[ORDERED_STATUSES[idx]]}
              </span>
            </MetricInfo>
          </div>
        )
      })}
    </figure>
  )
}

export default ProofStatus
