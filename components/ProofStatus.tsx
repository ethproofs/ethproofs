import type { Proof } from "@/lib/types"

import { cn } from "@/lib/utils"

import { MetricInfo } from "./ui/metric"
import { TooltipContentHeader } from "./ui/tooltip"
import StatusIcon from "./StatusIcon"

import { isCompleted } from "@/lib/proofs"

export const ProofStatusInfo = () => (
  <>
    <TooltipContentHeader>proof status</TooltipContentHeader>
    <div className="items-top grid grid-cols-[auto,1fr] gap-4">
      <StatusIcon status="proved" />
      Number of completed proofs that have been published for this block
      <StatusIcon status="proving" />
      Number of provers currently generating proofs for this block
      <StatusIcon status="queued" />
      Number of provers who have indicated intent to prove this block
    </div>
    <p className="text-body-secondary">
      Current status of proofs for this block
    </p>
  </>
)

type ProofStatusProps = React.HTMLAttributes<HTMLDivElement> & {
  proofs: Proof[]
}
const ProofStatus = ({ proofs, className, ...props }: ProofStatusProps) => {
  const completedProofs = proofs.filter(isCompleted)
  const provingProofs = proofs.filter((p) => p.proof_status === "proving")
  const queuedProofs = proofs.filter((p) => p.proof_status === "queued")

  return (
    <div
      className={cn("flex items-center gap-3 font-mono", className)}
      {...props}
    >
      <div className="flex items-center gap-1">
        <MetricInfo
          trigger={
            <div className="flex flex-nowrap items-center gap-1">
              <StatusIcon status="proved" />
              <span className="block">{completedProofs.length}</span>
            </div>
          }
        >
          <span className="!font-body text-body">
            Number of completed proofs that have been published for this block
          </span>
        </MetricInfo>
      </div>
      <div className="flex items-center gap-1">
        <MetricInfo
          trigger={
            <div className="flex flex-nowrap items-center gap-1">
              <StatusIcon status="proving" />
              <span className="block">{provingProofs.length}</span>
            </div>
          }
        >
          <span className="!font-body text-body">
            Number of provers currently generating proofs for this block
          </span>
        </MetricInfo>
      </div>
      <div className="flex items-center gap-1">
        <MetricInfo
          trigger={
            <div className="flex flex-nowrap items-center gap-1">
              <StatusIcon status="queued" />
              <span className="block">{queuedProofs.length}</span>
            </div>
          }
        >
          <span className="!font-body text-body">
            Number of provers who have indicated intent to prove this block
          </span>
        </MetricInfo>
      </div>
    </div>
  )
}

export default ProofStatus
