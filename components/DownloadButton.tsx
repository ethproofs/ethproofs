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
}

const DownloadButton = ({ className, proof }: DownloadButtonProps) => {
  const { proof_status, proof_id, size_bytes, team } = proof

  const teamName = team?.team_name ? team.team_name : "Team"

  const sizingClassName =
    "h-8 gap-2 self-center text-2xl sm:max-md:w-40 lg:w-40"
  const labelDisplay = "hidden sm:inline-block md:hidden lg:inline-block"
  const labelStyle = "text-nowrap text-xs font-bold"

  const fakeButtonClassName =
    "bg-body-secondary/10 hover:bg-body-secondary/10 cursor-auto"

  if (proof_status === "proved")
    return (
      <div className="flex flex-col items-center">
        <Button
          variant="outline"
          className={cn(sizingClassName, className)}
          asChild
        >
          <a href={`/api/v0/proofs/download/${proof_id}`} download>
            <ArrowDown />
            <span className={labelStyle}>
              <span className={labelDisplay}>
                Download {size_bytes ? "" : "proof"}
              </span>{" "}
              {size_bytes ? prettyBytes(size_bytes) : ""}
            </span>
          </a>
        </Button>
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
              <span
                className={cn(labelDisplay, labelStyle, "text-body-secondary")}
              >
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
              <span
                className={cn(labelDisplay, labelStyle, "text-body-secondary")}
              >
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
