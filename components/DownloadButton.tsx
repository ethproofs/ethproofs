"use client"

import prettyBytes from "pretty-bytes"

import type { Proof, Team } from "@/lib/types"

import ArrowDown from "@/components/svgs/arrow-down.svg"

import { cn } from "@/lib/utils"

import { Button } from "./ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import StatusIcon from "./StatusIcon"

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

  const teamName = team?.name ? team.name : "Team"

  const fakeButtonClassName =
    "bg-body-secondary/10 hover:bg-body-secondary/10 cursor-auto"

  const labelClassName = cn(
    "inline-block text-nowrap text-xs font-bold font-body",
    labelClass
  )

  const sizingClassName = "gap-2 self-center"

  if (proof_status === "proved")
    return (
      <div
        className={cn("flex items-center gap-x-2 gap-y-1", containerClass)}
        style={containerStyle}
      >
        <Button
          variant="outline"
          className={cn(sizingClassName, className)}
          asChild
        >
          <a href={`/api/v0/proofs/download/${proof_id}`} download>
            <ArrowDown className="size-4" />
            <span className={labelClassName}>download</span>
          </a>
        </Button>
        <span className="text-xs text-body-secondary">
          ({size_bytes ? prettyBytes(size_bytes) : ""})
        </span>
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
