"use client"

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

interface RealtimeProofRowProps {
  proof: ProofWithCluster
}

export function RealtimeProofRow({ proof }: RealtimeProofRowProps) {
  const { result: verificationResult, verify } = useServerVerifyProof(
    proof.proof_id
  )

  useEffect(() => {
    if (
      proof.proof_status === "proved" &&
      verificationResult.status === "idle"
    ) {
      verify()
    }
  }, [proof.proof_status, verificationResult.status, verify])

  const mapServerStatusToUi = (status: string): ProofStatus => {
    switch (status) {
      case "downloading":
        return "downloading"
      case "verifying":
        return "verifying"
      case "complete":
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

  const displayStatus =
    verificationResult.status !== "idle"
      ? mapServerStatusToUi(verificationResult.status)
      : (proof.proof_status as ProofStatus)

  const statusClasses = getProofStatusClasses(displayStatus)
  const statusText = getProofStatusText(displayStatus)
  const progressValue = getProofStatusProgressValue(displayStatus)

  const isVerified = displayStatus === "success"
  const isFailed = displayStatus === "failed" || displayStatus === "error"

  return (
    <div className="rounded-md py-1">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span
          className={cn("truncate text-xs font-medium", statusClasses.text)}
          title={proof.cluster_version.cluster.name}
        >
          {proof.cluster_version.cluster.name}
        </span>
        <div className="flex shrink-0 items-center gap-1.5">
          <span className={cn("text-[10px] font-medium", statusClasses.text)}>
            {statusText}
          </span>
          {isVerified && <Check className="size-3 text-primary" />}
          {isFailed && <X className={cn("size-3", statusClasses.text)} />}
        </div>
      </div>
      <Progress
        className="h-1.5"
        value={progressValue}
        indicatorClassName={cn(statusClasses.background, statusClasses.animate)}
      />
    </div>
  )
}
