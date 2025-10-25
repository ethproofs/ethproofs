import { Suspense } from "react"

import type { Team } from "@/lib/types"

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
    <Suspense fallback={<div>Loading blocks...</div>}>
      <BlocksTable
        className={className}
        machineType={machineType}
        teams={teams}
      />
    </Suspense>
  )
}
