import { Suspense } from "react"

import type { Team } from "@/lib/types"

import { Spinner } from "../ui/spinner"

import { BlocksTable } from "./blocks-table"

import type { MachineType } from "@/lib/api/blocks"

interface BlocksTableWithSuspenseProps {
  className?: string
  machineType: MachineType
  teams: Team[]
}

export function BlocksTableWithSuspense({
  className,
  machineType,
  teams,
}: BlocksTableWithSuspenseProps) {
  return (
    <Suspense
      fallback={
        <div className="mt-4 flex items-center gap-2">
          <Spinner className="text-muted-foreground" />
          <p className="text-muted-foreground">loading proofs...</p>
        </div>
      }
    >
      <BlocksTable
        className={className}
        machineType={machineType}
        teams={teams}
      />
    </Suspense>
  )
}
