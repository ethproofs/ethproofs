import { useEffect } from "react"
import { Check, X } from "lucide-react"

import type { ProofWithCluster } from "@/lib/types"

import { cn } from "@/lib/utils"

import { Progress } from "../ui/progress"

import {
  getProofStatusClasses,
  getProofStatusProgressValue,
  getProofStatusText,
  type ProofStatus,
} from "./realtime.utils"

import { useServerVerifyProof } from "@/lib/hooks/realtime/use-server-verify-proof"

interface ProofItemProps {
  proof: ProofWithCluster
}

export function ProofItem({ proof }: ProofItemProps) {
  const { result: verificationResult, verify } = useServerVerifyProof(
    proof.proof_id
  )

  // Start verification automatically when proof is "proved"
  useEffect(() => {
    if (
      proof.proof_status === "proved" &&
      verificationResult.status === "idle"
    ) {
      verify()
    }
  }, [proof.proof_status, verificationResult.status, verify])

  // Map server verification statuses to UI statuses
  const mapServerStatusToUi = (status: string): ProofStatus => {
    switch (status) {
      case "downloading":
        return "downloading"
      case "verifying":
        return "verifying"
      case "complete":
        // isValid can be true, false, or null (not available)
        if (
          verificationResult.isValid === null ||
          verificationResult.isValid === undefined
        ) {
          return "proved"
        }
        return verificationResult.isValid ? "success" : "failed"
      case "error":
        return "error"
      default:
        return proof.proof_status as ProofStatus
    }
  }

  // Determine display status
  const displayStatus =
    verificationResult.status !== "idle"
      ? mapServerStatusToUi(verificationResult.status)
      : (proof.proof_status as ProofStatus)

  const statusText = getProofStatusText(displayStatus)
  const statusClasses = getProofStatusClasses(displayStatus)
  const statusProgressValue = getProofStatusProgressValue(displayStatus)

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
          {displayStatus === "success" && (
            <Check className="h-4 w-4 text-primary" />
          )}
          {(displayStatus === "failed" || displayStatus === "error") && (
            <X className={cn("h-4 w-4", statusClasses.text)} />
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
