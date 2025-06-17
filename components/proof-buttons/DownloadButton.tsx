"use client"

import { useState } from "react"
import { ArrowDown, Check, Download } from "lucide-react"
import prettyBytes from "pretty-bytes"

import type { Proof, Team } from "@/lib/types"

import { cn } from "@/lib/utils"

import StatusIcon from "../StatusIcon"
import { Button } from "../ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"

import { useDownloadProof } from "./useDownloadProof"
import {
  getProofButtonClasses,
  getProofButtonLabel,
  getProofButtonTextColorClass,
  ProofButtonState,
} from "./utils"
import { useAnimateCheckmark } from "@/hooks/useAnimateCheckmark"

export type ProofForDownload = Required<
  Pick<Proof, "proof_status" | "proof_id" | "size_bytes">
> & {
  team: Required<Pick<Team, "name">>
}

type DownloadButtonProps = {
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
  containerStyle,
  labelClass,
}: DownloadButtonProps) => {
  const { proof_status, proof_id, size_bytes, team } = proof
  const [buttonState, setButtonState] = useState<ProofButtonState>("download")
  const { downloadProof, downloadProgress, downloadSpeed } = useDownloadProof()
  const { checkRef, checkmarkAnimation } = useAnimateCheckmark(buttonState)

  async function onDownloadProof(proof_id: number) {
    try {
      setButtonState("downloading")
      await downloadProof(proof_id)
      setButtonState("success")
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
          asChild
          variant="outline"
          className={cn(
            className,
            getProofButtonClasses(buttonState),
            sizingClassName
          )}
          size="icon"
          onClick={() => onDownloadProof(proof_id)}
        >
          <div>
            {/* Progress bars */}
            {buttonState === "downloading" && (
              <div
                className="absolute left-0 top-0 h-full bg-green-300/20 transition-all duration-100"
                style={{ width: `${downloadProgress}%` }}
              />
            )}
            {buttonState === "success" && (
              <>
                <div className="animate-success-pulse absolute inset-0 bg-green-500 opacity-20" />
                <div className="animate-success-ring absolute -inset-4 rounded-full border border-green-500/30" />
              </>
            )}

            {buttonState === "download" && (
              <ArrowDown className="size-5 text-green-500" />
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
          </div>
        </Button>

        {buttonState === "downloading" &&
        downloadProgress > 5 &&
        downloadProgress < 98 ? (
          <span className="text-xs text-green-300 opacity-80">
            {downloadSpeed} MB/s
          </span>
        ) : (
          <span className="animate-fade-in text-xs text-gray-400 opacity-0">
            {size_bytes ? prettyBytes(size_bytes) : ""}
          </span>
        )}
      </div>
    )

  if (proof_status === "proving")
    return (
      <Popover>
        <PopoverTrigger style={containerStyle}>
          <Button variant="outline" asChild>
            <div
              className={cn(sizingClassName, fakeButtonClassName, className)}
            >
              <StatusIcon status="proving" className="animate-pulse" />
              <span className={cn(labelClassName, "text-body-secondary")}>
                proving
              </span>
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          {teamName} currently generating proof for this block
        </PopoverContent>
      </Popover>
    )

  if (proof_status === "queued")
    return (
      <Popover>
        <PopoverTrigger style={containerStyle}>
          <Button variant="outline" asChild>
            <div
              className={cn(sizingClassName, fakeButtonClassName, className)}
            >
              <StatusIcon status="queued" />
              <span className={cn(labelClassName, "text-body-secondary")}>
                queued
              </span>
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          {teamName} has indicated intent to prove this block
        </PopoverContent>
      </Popover>
    )
}

export default DownloadButton
