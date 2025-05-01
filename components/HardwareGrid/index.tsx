import { useMemo } from "react"

import type { ClusterDetails } from "@/lib/types"

import { cn } from "@/lib/utils"

import MachineBox from "./MachineBox"
import { getBoxColor } from "./utils"

type ClusterDetailsProps = React.ComponentProps<"div"> & {
  cluster: ClusterDetails
}

const HardwareGrid = ({ cluster, className }: ClusterDetailsProps) => {
  const totalGpuCount = useMemo(
    () => cluster.machines.reduce((acc, curr) => acc + curr.gpuCount, 0),
    [cluster.machines]
  )

  const totalMachineCount = useMemo(
    () => cluster.machines.reduce((acc, curr) => acc + curr.count, 0),
    [cluster.machines]
  )

  return (
    <div
      className={cn("grid w-fit grid-rows-5 gap-1", className)}
      style={{ gridAutoFlow: "column" }}
    >
      {/* Create machine cells */}
      {cluster.machines.map((machine) =>
        // Create array of indices for the count of this machine type
        [...Array(machine.count)].map((_, countIdx) => {
          const uniqueKey = `machine-${machine.id}-${countIdx}`
          return (
            <MachineBox
              key={uniqueKey}
              name={cluster.name}
              machines={cluster.machines}
              totalGpuCount={totalGpuCount}
            />
          )
        })
      )}

      {/* Fill remaining cells */}
      {[...Array(2 ** 8 - totalMachineCount)].map((_, i) => (
        <div
          key={`empty-${i}`}
          className={cn("size-6 rounded-[4px]", getBoxColor(0))}
        />
      ))}
    </div>
  )
}

HardwareGrid.displayName = "HardwareGrid"

export default HardwareGrid
