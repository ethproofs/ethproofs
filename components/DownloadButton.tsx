"use client"

import prettyBytes from "pretty-bytes"

import type { Proof } from "@/lib/types"

import ArrowDown from "@/components/svgs/arrow-down.svg"

import { cn } from "@/lib/utils"

import { Button } from "./ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import StatusIcon from "./StatusIcon"

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

  const teamName = team?.name ? team.name : "Team"

  const fakeButtonClassName =
    "bg-body-secondary/10 hover:bg-body-secondary/10 cursor-auto"

  const labelClassName = cn(
    "inline-block text-nowrap text-xs font-bold font-body",
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
      <Popover>
        <PopoverTrigger>
          <Button size="icon" variant="outline" asChild>
            <div
              className={cn(sizingClassName, fakeButtonClassName, className)}
            >
              <StatusIcon status="proving" className="animate-pulse" />
              <span className={cn(labelClassName, "text-body-secondary")}>
                Proving
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
        <PopoverTrigger>
          <Button size="icon" variant="outline" asChild>
            <div
              className={cn(sizingClassName, fakeButtonClassName, className)}
            >
              <StatusIcon status="queued" />
              <span className={cn(labelClassName, "text-body-secondary")}>
                Queued
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
