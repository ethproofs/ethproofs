"use client"

import prettyBytes from "pretty-bytes"

import type { Proof } from "@/lib/types"

import ArrowDown from "@/components/svgs/arrow-down.svg"

import { cn } from "@/lib/utils"

import { Button } from "./ui/button"
import StatusIcon from "./StatusIcon"
import Tooltip from "./Tooltip"

type DownloadButtonProps = {
  proof: Proof
  className?: string
  containerClass?: string
  labelClass?: string
}

const DownloadButton = ({
  className,
  proof,
  containerClass = "flex-col",
  labelClass,
}: DownloadButtonProps) => {
  const { proof_status, proof_id, size_bytes, team } = proof

  const teamName = team?.team_name ? team.team_name : "Team"

  const fakeButtonClassName =
    "bg-body-secondary/10 hover:bg-body-secondary/10 cursor-auto"

  const labelClassName = cn(
    "inline-block text-nowrap text-xs font-bold",
    labelClass
  )

  const sizingClassName = "h-8 gap-2 self-center text-2xl"

  if (proof_status === "proved")
    return (
      <div className={cn("flex items-center gap-x-2 gap-y-1", containerClass)}>
        <Button
          variant="outline"
          className={cn(sizingClassName, className)}
          size="icon"
          asChild
        >
          <a href={`/api/v0/proofs/download/${proof_id}`} download>
            <ArrowDown />
            <span className={labelClassName}>Download proof</span>
          </a>
        </Button>
        <span className="text-xs text-body-secondary">
          {size_bytes ? prettyBytes(size_bytes) : ""}
        </span>
      </div>
    )

  if (proof_status === "proving")
    return (
      <Tooltip
        content={`${teamName} currently generating proof for this block`}
      >
        <Button size="icon" variant="outline" asChild>
          <div className={cn(fakeButtonClassName, sizingClassName, className)}>
            <StatusIcon status="proving" className="animate-pulse" />
            <span className={cn(labelClassName, "text-body-secondary")}>
              Proving
            </span>
          </div>
        </Button>
      </Tooltip>
    )

  if (proof_status === "queued")
    return (
      <Tooltip content={`${teamName} has indicated intent to prove this block`}>
        <Button size="icon" variant="outline" asChild>
          <div className={cn(fakeButtonClassName, sizingClassName, className)}>
            <StatusIcon status="queued" />
            <span className={cn(labelClassName, "text-body-secondary")}>
              Queued
            </span>
          </div>
        </Button>
      </Tooltip>
    )
}

export default DownloadButton
