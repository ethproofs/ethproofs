"use client"

import type { Proof, Team } from "@/lib/types"

import ArrowDown from "@/components/svgs/arrow-down.svg"

import { cn } from "@/lib/utils"

import { Button } from "./ui/button"
import StatusIcon from "./StatusIcon"
import Tooltip from "./Tooltip"

type DownloadButtonProps = {
  proof: Proof & { team?: Team }
  className?: string
}

const DownloadButton = ({ className, proof }: DownloadButtonProps) => {
  const { proof_status, proof: binary, team } = proof
  const teamName = team?.team_name ? team.team_name : "Team"

  const sizingClassName =
    "h-8 gap-2 self-center text-2xl sm:max-md:w-40 lg:w-40"
  const labelClassName =
    "hidden text-nowrap text-xs font-bold sm:block md:hidden lg:block"
  const fakeButtonClassName =
    "bg-body-secondary/10 hover:bg-body-secondary/10 cursor-auto"

  if (proof_status === "proved")
    return (
      <Button
        variant="outline"
        className={cn(sizingClassName, className)}
        size="icon"
        disabled={!binary}
        asChild
      >
        <a href={`/api/v0/proofs/download/${proof.proof_id}`} download>
          <ArrowDown />
          <span className={labelClassName}>Download proof</span>
        </a>
      </Button>
    )

  if (proof_status === "proving")
    return (
      <Tooltip
        content={`${teamName} currently generating proof for this block`}
      >
        <Button size="icon" variant="outline" asChild>
          <div className={cn(sizingClassName, fakeButtonClassName, className)}>
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
          <div className={cn(sizingClassName, fakeButtonClassName, className)}>
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
