import { Fragment } from "react"

import * as Info from "@/components/ui/info"

import { cn } from "@/lib/utils"

import {
  Tooltip,
  TooltipContent,
  TooltipContentHeader,
  TooltipTrigger,
} from "./ui/tooltip"
import StatusIcon from "./StatusIcon"

const ORDERED_STATUSES = ["proved", "proving", "queued"] as const

const DESCRIPTIONS = {
  proved: "proved",
  proving: "proving",
  queued: "queued",
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
    <Info.Description>current status of proofs</Info.Description>
  </>
)

type ProofStatusProps = React.HTMLAttributes<HTMLDivElement> & {
  statusCount: Record<string, number>
  hideEmpty?: boolean
}
const ProofStatus = ({
  statusCount,
  className,
  hideEmpty = true,
  ...props
}: ProofStatusProps) => {
  return (
    <figure className={cn("flex items-start gap-4", className)} {...props}>
      {ORDERED_STATUSES.map((status) => {
        const count = statusCount[status] ?? 0
        // Hide if no proofs for that status
        if (count === 0 && hideEmpty) return null
        return (
          <Tooltip key={status}>
            <TooltipTrigger>
              <div className="flex items-center gap-1">
                <StatusIcon
                  status={status}
                  className="size-4 hover:opacity-80"
                />{" "}
                {count}
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-80 sm:max-w-96">
              <span className="text-xs">{DESCRIPTIONS[status]}</span>
            </TooltipContent>
          </Tooltip>
        )
      })}
    </figure>
  )
}

export default ProofStatus
