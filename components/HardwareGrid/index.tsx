import { useMemo } from "react"

import type { ClusterMachineBase, MachineBase } from "@/lib/types"

import { cn, sumArray } from "@/lib/utils"

import MachineBox from "./MachineBox"
import { getBoxColor } from "./utils"

type HardwareGridProps = React.ComponentProps<"div"> & {
  clusterMachines: (ClusterMachineBase & {
    machine: MachineBase
  })[]
}

const HardwareGrid = ({ clusterMachines, className }: HardwareGridProps) => {
  const totalGpuCount = useMemo(
    () =>
      clusterMachines.reduce(
        (acc, curr) => acc + sumArray(curr.machine.gpu_count),
        0
      ),
    [clusterMachines]
  )

  const totalMachineCount = useMemo(
    () => clusterMachines.reduce((acc, curr) => acc + curr.machine_count, 0),
    [clusterMachines]
  )

  return (
    <div
      className={cn("grid w-fit grid-rows-5 gap-1", className)}
      style={{ gridAutoFlow: "column" }}
    >
      {/* Machine cells */}
      {clusterMachines.map((clusterMachine) =>
        // Create array of indices for the count of this machine type
        [...Array(clusterMachine.machine_count)].map((_, countIdx) => {
          const uniqueKey = `machine-${clusterMachine.id}-${countIdx}`
          return (
            <MachineBox
              key={uniqueKey}
              className={getBoxColor(totalGpuCount)}
              machine={clusterMachine.machine}
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
