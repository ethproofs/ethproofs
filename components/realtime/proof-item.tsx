import { Check, X } from "lucide-react"

import { ProofWithCluster } from "@/lib/types"

import { cn } from "@/lib/utils"

import { Progress } from "../ui/progress"

import { useAutoVerifyProof } from "./useAutoVerifyProof"
import {
  getProofStatusClasses,
  getProofStatusProgressValue,
  getProofStatusText,
  ProofStatus,
} from "./utils"

interface ProofItemProps {
  proof: ProofWithCluster
}

export function ProofItem({ proof }: ProofItemProps) {
  const verificationResult = useAutoVerifyProof(
    proof.proof_id,
    proof.cluster_id,
    proof.proof_status
  )

  // Initial status
  let statusText = getProofStatusText(proof.proof_status as ProofStatus)
  let statusClasses = getProofStatusClasses(proof.proof_status as ProofStatus)
  let statusProgressValue = getProofStatusProgressValue(
    proof.proof_status as ProofStatus
  )

  // Verification status
  const isVerifying =
    verificationResult.status === "downloading" ||
    verificationResult.status === "verifying"

  if (isVerifying) {
    statusText = getProofStatusText(verificationResult.status as ProofStatus)
    statusClasses = getProofStatusClasses(
      verificationResult.status as ProofStatus
    )
    statusProgressValue = getProofStatusProgressValue(
      verificationResult.status as ProofStatus
    )
  }

  return (
    <div key={proof.proof_id} className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-end gap-2 text-sm">
          <span className={statusClasses.text}>
            {proof.cluster_version.cluster.nickname}
          </span>
          <span className="inline text-xs text-muted-foreground">
            {proof.cluster_id}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn("text-sm font-medium", statusClasses.text)}>
            {statusText}
          </span>
          {verificationResult.status === "success" && (
            <Check className="h-4 w-4 text-primary" />
          )}
          {(verificationResult.status === "failed" ||
            verificationResult.status === "error") && (
            <X className="h-4 w-4 text-destructive" />
          )}
        </div>
      </div>
      <Progress
        className="h-2"
        value={statusProgressValue}
        indicatorClassName={cn(statusClasses.background, statusClasses.animate)}
      />
    </div>
  )
}
