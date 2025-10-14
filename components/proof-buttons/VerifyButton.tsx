"use client"

import { useEffect, useState } from "react"
import { ArrowDown, CalendarCheck, Check, LoaderCircle } from "lucide-react"
import prettyBytes from "pretty-bytes"

import type { Proof, Team } from "@/lib/types"

import WasmErrorBoundary from "@/components/error-boundaries/WasmErrorBoundary"

import { cn } from "@/lib/utils"

import { Button } from "../ui/button"

import { useDownloadProof } from "./useDownloadProof"
import { useDownloadVerificationKey } from "./useDownloadVerificationKey"
import { useVerifyProof } from "./useVerifyProof"
import {
  getProofButtonClasses,
  getProofButtonLabel,
  getProofButtonTextColorClass,
  ProofButtonState,
  proofButtonStateMap,
} from "./utils"

import { useAnimateCheckmark } from "@/hooks/useAnimateCheckmark"
import { delay } from "@/lib/utils"

export type ProofForDownload = Required<
  Pick<Proof, "proof_status" | "proof_id" | "size_bytes">
> & {
  team: Required<Pick<Team, "name" | "slug">>
}

const VERIFIABLE_PROVER_TEAM_SLUGS = new Set<string>(["brevis", "zkm", "zisk"])
function isVerifiableProverTeam(slug: string): boolean {
  return VERIFIABLE_PROVER_TEAM_SLUGS.has(slug)
}

interface VerifyButtonProps {
  proof: ProofForDownload
  className?: string
  containerClass?: string
  labelClass?: string
}
export function VerifyButton({
  className,
  proof,
  containerClass = "flex-col",
  labelClass,
}: VerifyButtonProps) {
  const { proof_status, proof_id, size_bytes } = proof
  const [buttonState, setButtonState] = useState<ProofButtonState>("verify")
  const { downloadProof, downloadProgress, downloadSpeed } = useDownloadProof()
  const downloadVerificationKey = useDownloadVerificationKey()
  const { checkRef, checkmarkAnimation } = useAnimateCheckmark(buttonState)

  const prover = proof.team.slug.toLowerCase()
  const { verifyProof, verifyTime } = useVerifyProof(prover)

  useEffect(() => {
    setButtonState((prev) => {
      if (prev !== "verify" && prev !== "disabled") return prev
      if (proof_status !== "proved") return "disabled"
      return isVerifiableProverTeam(prover) ? "verify" : "disabled"
    })
  }, [prover])

  async function onVerifyProof(proof_id: number) {
    // Downloading proof
    console.log("Downloading proof...")
    setButtonState(proofButtonStateMap.downloading)
    const [proofBytes, vkBytes] = await Promise.all([
      downloadProof(proof_id),
      downloadVerificationKey(proof_id),
    ])
    if (!proofBytes || !vkBytes)
      return setButtonState(proofButtonStateMap.error)
    // Verifying proof
    setButtonState(proofButtonStateMap.verifying)
    await delay(100)
    console.log("Verifying proof...")
    const result = await verifyProof(proofBytes, vkBytes)
    setButtonState(
      result.isValid ? proofButtonStateMap.success : proofButtonStateMap.failed
    )
    await delay(2000)
    setButtonState("verify")
  }

  const labelClassName = cn(
    "inline-block text-nowrap text-xs font-bold font-body",
    labelClass
  )

  const sizingClassName = "relative h-8 gap-2 self-center text-2xl"
  const textColorClassName = getProofButtonTextColorClass(buttonState)

  return (
    <WasmErrorBoundary>
      <div className={cn("flex items-center gap-x-2 gap-y-1", containerClass)}>
        <Button
          disabled={buttonState === "disabled" || buttonState !== "verify"}
          variant="outline"
          className={cn(
            sizingClassName,
            getProofButtonClasses(buttonState),
            className
          )}
          onClick={() => onVerifyProof(proof_id)}
        >
          {/* Progress bars */}
          {buttonState === "downloading" && (
            <div
              className="absolute left-0 top-0 h-full bg-green-300/20 transition-all duration-100"
              style={{ width: `${downloadProgress}%` }}
            />
          )}
          {buttonState === "verifying" && (
            <div
              className="absolute left-0 top-0 h-full bg-green-500/20 transition-all duration-100"
              style={{ width: `${downloadProgress}%` }}
            />
          )}
          {buttonState === "success" && (
            <>
              <div className="absolute inset-0 animate-success-pulse bg-green-500 opacity-20" />
              <div className="absolute -inset-4 animate-success-ring rounded-full border border-green-500/30" />
            </>
          )}

          {(buttonState === "disabled" || buttonState === "verify") && (
            <CalendarCheck className={cn("size-5", textColorClassName)} />
          )}
          {buttonState === "downloading" && (
            <ArrowDown className="size-5 animate-pulse text-green-300" />
          )}
          {buttonState === "verifying" && (
            <LoaderCircle className="size-5 animate-spin text-green-400" />
          )}
          {buttonState === "success" && (
            <Check
              ref={checkRef}
              className="size-5 text-green-500"
              style={checkmarkAnimation()}
            />
          )}
          <span className={cn(labelClassName, textColorClassName)}>
            {getProofButtonLabel(buttonState)}
          </span>
        </Button>

        {buttonState === "verify" && (
          <span className="text-xs text-body-secondary">in-browser</span>
        )}
        {buttonState === "downloading" &&
          downloadProgress > 5 &&
          downloadProgress < 98 && (
            <span className="text-xs text-green-300 opacity-80">
              {downloadSpeed} MB/s
            </span>
          )}
        {buttonState === "verifying" && (
          <span className="animate-fade-in text-xs text-body-secondary">
            {size_bytes ? prettyBytes(size_bytes) : ""}
          </span>
        )}
        {buttonState === "success" && (
          <span className="animate-fade-in text-xs text-body-secondary">
            {`${verifyTime}ms`}
          </span>
        )}
      </div>
    </WasmErrorBoundary>
  )
}
