"use client"

import { useEffect, useState } from "react"
import { ArrowDown, CalendarCheck, Check, LoaderCircle } from "lucide-react"

import type { ProofWithCluster } from "@/lib/types"

import WasmErrorBoundary from "@/components/error-boundaries/WasmErrorBoundary"
import { useDownloadVerificationKey } from "@/components/proof-buttons/use-download-verification-key"
import { useVerifyProof } from "@/components/proof-buttons/use-verify-proof"

import { cn } from "@/lib/utils"
import { delay } from "@/lib/utils"

import { Button } from "../ui/button"

import {
  getProofButtonClasses,
  getProofButtonLabel,
  getProofButtonTextColorClass,
  ProofButtonState,
  proofButtonStateMap,
} from "./proof-buttons.utils"
import { useDownloadProof } from "./use-download-proof"

import { useAnimateCheckmark } from "@/lib/hooks/ui/use-animate-checkmark"
import {
  isVerifiableZkvm,
  isVerifiableZkvmWithoutVk,
} from "@/lib/zkvm-verifiers"

interface VerifyButtonProps {
  proof: ProofWithCluster
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
  const { proof_status, proof_id } = proof
  const [buttonState, setButtonState] = useState<ProofButtonState>("verify")
  const { downloadProof, downloadProgress, downloadSpeed } = useDownloadProof()
  const downloadVerificationKey = useDownloadVerificationKey()
  const { checkRef, checkmarkAnimation } = useAnimateCheckmark(buttonState)

  const zkvmSlug = proof.cluster_version?.zkvm_version?.zkvm?.slug

  const isVerifiable =
    zkvmSlug &&
    isVerifiableZkvm(zkvmSlug) &&
    (isVerifiableZkvmWithoutVk(zkvmSlug) || proof.cluster_version?.vk_path)

  const { verifyProof, verifyTime } = useVerifyProof(
    isVerifiable ? zkvmSlug : undefined
  )

  useEffect(() => {
    setButtonState((prev) => {
      if (prev !== "verify" && prev !== "disabled") return prev
      if (proof_status !== "proved") return "disabled"
      return isVerifiable ? "verify" : "disabled"
    })
  }, [isVerifiable, proof_status])

  async function onVerifyProof(proof_id: number) {
    console.log("Downloading proof...")
    setButtonState(proofButtonStateMap.downloading)

    const needsVk = zkvmSlug && !isVerifiableZkvmWithoutVk(zkvmSlug)
    const [proofBytes, vkBytes] = await Promise.all([
      downloadProof(proof_id),
      needsVk
        ? downloadVerificationKey(proof_id)
        : Promise.resolve(new Uint8Array(0)),
    ])

    if (!proofBytes || (needsVk && !vkBytes)) {
      return setButtonState(proofButtonStateMap.error)
    }

    setButtonState(proofButtonStateMap.verifying)
    await delay(100)
    console.log("Verifying proof...")
    const result = await verifyProof(proofBytes, vkBytes ?? new Uint8Array(0))
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
        {buttonState === "success" && (
          <span className="animate-fade-in text-xs text-body-secondary">
            {`${verifyTime}ms`}
          </span>
        )}
      </div>
    </WasmErrorBoundary>
  )
}
