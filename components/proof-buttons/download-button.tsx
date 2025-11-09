"use client"

import { useState } from "react"
import { ArrowDown, Check } from "lucide-react"
import prettyBytes from "pretty-bytes"
import { toast } from "sonner"

import type { Proof, Team } from "@/lib/types"

import { cn } from "@/lib/utils"
import { delay } from "@/lib/utils"

import StatusIcon from "../StatusIcon"
import { Button } from "../ui/button"

import {
  getProofButtonClasses,
  getProofButtonLabel,
  getProofButtonTextColorClass,
  ProofButtonState,
} from "./utils"

import { useAnimateCheckmark } from "@/hooks/useAnimateCheckmark"
import { useDownloadProof } from "@/hooks/verify-proof/use-download-proof"

export type ProofForDownload = Required<
  Pick<Proof, "proof_status" | "proof_id" | "size_bytes">
> & {
  team: Required<Pick<Team, "name" | "slug">>
}

interface DownloadButtonProps {
  proof: ProofForDownload
  className?: string
  containerClass?: string
  containerStyle?: React.CSSProperties
  labelClass?: string
}

const DownloadButton = ({
  className,
  proof,
  containerClass = "flex-col",
  labelClass,
}: DownloadButtonProps) => {
  const { proof_status, proof_id, size_bytes, team } = proof
  const [buttonState, setButtonState] = useState<ProofButtonState>("download")
  const { downloadProof, downloadProgress, downloadSpeed } = useDownloadProof()
  const { checkRef, checkmarkAnimation } = useAnimateCheckmark(buttonState)

  async function onDownloadProof(proofId: number) {
    try {
      setButtonState("downloading")
      await downloadProof(proofId, true)
      setButtonState("success")
      await delay(2000)
      setButtonState("download")
    } catch (err) {
      console.log(err)
      setButtonState("error")
    }
  }

  const teamName = team?.name ? team.name : "Team"

  const fakeButtonClassName =
    "bg-body-secondary/10 hover:bg-body-secondary/10 cursor-auto"

  const labelClassName = cn(
    "inline-block text-nowrap text-xs font-bold font-body",
    labelClass
  )

  const sizingClassName = "relative h-8 gap-2 self-center text-2xl"

  if (proof_status === "proved")
    return (
      <div className={cn("flex items-center gap-x-2 gap-y-1", containerClass)}>
        <Button
          disabled={buttonState !== "download"}
          variant="outline"
          className={cn(
            sizingClassName,
            getProofButtonClasses(buttonState),
            className
          )}
          onClick={() => onDownloadProof(proof_id)}
        >
          {/* Progress bars */}
          {buttonState === "downloading" && (
            <div
              className="absolute left-0 top-0 h-full bg-green-300/20 transition-all duration-100"
              style={{ width: `${downloadProgress}%` }}
            />
          )}
          {buttonState === "success" && (
            <>
              <div className="absolute inset-0 animate-success-pulse bg-green-500 opacity-20" />
              <div className="absolute -inset-4 animate-success-ring rounded-full border border-green-500/30" />
            </>
          )}

          {buttonState === "download" && (
            <ArrowDown className="size-5 text-primary" />
          )}
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
              labelClassName,
              getProofButtonTextColorClass(buttonState)
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
            {size_bytes ? prettyBytes(size_bytes) : ""}
          </span>
        )}
      </div>
    )

  if (proof_status === "queued")
    return (
      <div className={cn("flex items-center gap-x-2 gap-y-1", containerClass)}>
        <Button
          variant="outline"
          className={cn(sizingClassName, fakeButtonClassName, className)}
          onClick={() =>
            toast(`${teamName} has indicated intent to prove this block`)
          }
        >
          <StatusIcon status="queued" className="size-5" />
          <span className={cn(labelClassName, "text-body-secondary")}>
            queued
          </span>
        </Button>
      </div>
    )

  if (proof_status === "proving")
    return (
      <div className={cn("flex items-center gap-x-2 gap-y-1", containerClass)}>
        <Button
          variant="outline"
          className={cn(sizingClassName, fakeButtonClassName, className)}
          onClick={() =>
            toast(`${teamName} is generating the proof for this block`)
          }
        >
          <StatusIcon status="proving" className="size-5 animate-pulse" />
          <span className={cn(labelClassName, "text-body-secondary")}>
            proving
          </span>
        </Button>
      </div>
    )
}

export default DownloadButton
