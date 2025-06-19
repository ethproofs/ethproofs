"use client"

import { useState } from "react"
import { ArrowDown, CalendarCheck, Check } from "lucide-react"

import type { Proof, Team } from "@/lib/types"

import { cn } from "@/lib/utils"

import { Button } from "../ui/button"

import { useDownloadProof } from "./useDownloadProof"
import {
  getProofButtonLabel,
  ProofButtonState,
  proofButtonStateMap,
} from "./utils"

import { useAnimateCheckmark } from "@/hooks/useAnimateCheckmark"

export type ProofForDownload = Required<
  Pick<Proof, "proof_status" | "proof_id" | "size_bytes">
> & {
  team: Required<Pick<Team, "name">>
}

interface VerifyButtonProps {
  proof: ProofForDownload
  className?: string
  containerClass?: string
  labelClass?: string
}

// This button is temporarily disabled
const VerifyButton = ({
  className,
  proof,
  containerClass = "flex-col",
  labelClass,
}: VerifyButtonProps) => {
  const { proof_status, proof_id } = proof
  const [buttonState, setButtonState] = useState<ProofButtonState>("verify")
  const { downloadProof, downloadProgress, downloadSpeed } = useDownloadProof()
  const { checkRef, checkmarkAnimation } = useAnimateCheckmark(buttonState)

  // TODO: Implement in-browser proof verification
  async function onVerifyProof(proof_id: number) {
    // Downloading proof
    console.log("Downloading proof...")
    setButtonState(proofButtonStateMap.downloading)
    const proof = await downloadProof(proof_id)
    if (!proof) return setButtonState(proofButtonStateMap.error)
    console.log("Proof downloaded:", proof)
    // Verifying proof
    console.log("Verifying proof...")
    setButtonState(proofButtonStateMap.verifying)
    // const result = verifyProof(proof)
    return
  }

  const labelClassName = cn(
    "inline-block text-nowrap text-xs font-bold font-body",
    labelClass
  )

  const sizingClassName = "relative h-8 gap-2 self-center text-2xl"

  if (proof_status === "proved")
    return (
      <div className={cn("flex items-center gap-x-2 gap-y-1", containerClass)}>
        <Button
          disabled
          variant="solid"
          className={cn(sizingClassName, className)}
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
              // style={{ width: `${verificationProgress}%` }}
            />
          )}
          {buttonState === "success" && (
            <>
              <div className="absolute inset-0 animate-success-pulse bg-green-500 opacity-20" />
              <div className="absolute -inset-4 animate-success-ring rounded-full border border-green-500/30" />
            </>
          )}

          {buttonState === "verify" && <CalendarCheck className="size-5" />}
          {buttonState === "downloading" && (
            <ArrowDown className="size-5 animate-pulse text-green-300" />
          )}
          {buttonState === "success" && (
            <Check
              ref={checkRef}
              className="size-5 text-green-500"
              style={checkmarkAnimation()}
            />
          )}
          <span
            className={cn(
              labelClassName
              // getProofButtonTextColorClass(buttonState)
            )}
          >
            {getProofButtonLabel(buttonState)}
          </span>
        </Button>

        {buttonState === "downloading" &&
        downloadProgress > 5 &&
        downloadProgress < 98 ? (
          <span className="text-xs text-green-300 opacity-80">
            {downloadSpeed} MB/s
          </span>
        ) : (
          <span className="animate-fade-in text-xs text-body-secondary">
            in-browser (soon™)
          </span>
        )}
      </div>
    )
}

export default VerifyButton
