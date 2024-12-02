import type { Proof, Team } from "@/lib/types"

import ArrowDown from "@/components/svgs/arrow-down.svg"

import { cn } from "@/lib/utils"

import { Button } from "./ui/button"
import StatusIcon from "./StatusIcon"
import Tooltip from "./Tooltip"

const DownloadButton = ({ proof, team }: { proof: Proof; team?: Team }) => {
  const { proof_status, proved_timestamp } = proof
  const isComplete = proof_status === "proved" && !!proved_timestamp

  return (
    <div
      className={cn(
        "ms-auto self-center",
        "col-span-1 col-start-4 row-span-1 row-start-1",
        "sm:col-span-2 sm:col-start-3 sm:row-span-1 sm:row-start-1",
        "md:col-span-1 md:col-start-6 md:row-span-1 md:row-start-1"
      )}
    >
      {proof_status === "proved" && (
        <Button
          variant="outline"
          className={cn(
            "aspect-square h-8 w-auto gap-2 self-center text-2xl text-primary",
            "disabled:bg-body-secondary/10 sm:max-md:w-40 lg:aspect-auto lg:w-40"
          )}
          size="icon"
          isSecondary={!isComplete}
          disabled={!isComplete}
        >
          <ArrowDown />
          <span className="hidden text-nowrap text-xs font-bold sm:block md:hidden lg:block">
            Download proof
          </span>
        </Button>
      )}
      {proof_status === "proving" && (
        <Tooltip
          content={`${team?.team_name ? team.team_name : "Team"} currently generating proof for this block`}
        >
          <div
            className={cn(
              "inline-flex items-center justify-center gap-4 rounded-full border border-solid border-current text-primary [&>svg]:shrink-0",
              "aspect-square h-8 w-auto min-w-fit gap-2 self-center text-2xl text-primary",
              "bg-body-secondary/10 sm:max-md:w-40 lg:aspect-auto lg:w-40",
              "flex items-center gap-2"
            )}
          >
            <StatusIcon status="proving" />
            <span className="hidden text-nowrap text-xs font-bold text-body-secondary sm:block md:hidden lg:block">
              Proving
            </span>
          </div>
        </Tooltip>
      )}
      {proof_status === "queued" && (
        <Tooltip
          content={`${team?.team_name ? team.team_name : "Team"} has indicated intent to prove this block`}
        >
          <div
            className={cn(
              "inline-flex items-center justify-center gap-4 rounded-full border border-solid border-current text-primary [&>svg]:shrink-0",
              "aspect-square h-8 w-auto min-w-fit gap-2 self-center text-2xl text-primary",
              "bg-body-secondary/10 sm:max-md:w-40 lg:aspect-auto lg:w-40",
              "flex items-center gap-2"
            )}
          >
            <StatusIcon status="queued" />
            <span className="hidden text-nowrap text-xs font-bold text-body-secondary sm:block md:hidden lg:block">
              Queued
            </span>
          </div>
        </Tooltip>
      )}
    </div>
  )
}

export default DownloadButton
