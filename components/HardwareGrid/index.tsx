import { useMemo } from "react"

import type { ClusterMachineBase, MachineBase } from "@/lib/types"

import { cn, sumArray } from "@/lib/utils"

import MachineBox from "./MachineBox"
import { getBoxClassesByValue } from "./utils"

type HardwareGridProps = React.ComponentProps<"div"> & {
  clusterMachines: (ClusterMachineBase & {
    machine: MachineBase
  })[]
}

const HardwareGrid = ({ clusterMachines, className }: HardwareGridProps) => {
  const totalMachineCount = useMemo(
    () => clusterMachines.reduce((acc, curr) => acc + curr.machine_count, 0),
    [clusterMachines]
  )

  const sharedClasses = "size-10 rounded-[4px]"

  return (
    <div
      className={cn("grid w-fit grid-rows-4 gap-2", className)}
      style={{ gridAutoFlow: "column" }}
    >
      {/* Machine cells */}
      {clusterMachines.map((clusterMachine) =>
        // Create array of indices for the count of this machine type
        [...Array(clusterMachine.machine_count)].map((_, countIdx) => {
          const uniqueKey = `machine-${clusterMachine.id}-${countIdx}`
          const gpuCount = sumArray(clusterMachine.machine.gpu_count)

          return (
            <MachineBox
              key={uniqueKey}
              className={cn(
                "transition-all hover:scale-[115%] hover:rounded-[6px] hover:transition-all",
                sharedClasses,
                getBoxClassesByValue(gpuCount)
              )}
              style={{ animationDelay: `${Math.random() * countIdx * 100}ms` }}
              machine={clusterMachine.machine}
            />
          )
        })
      )}

      {/* Fill remaining cells */}
      {[...Array(2 ** 5 - totalMachineCount)].map((_, i) => (
        <div
          key={`empty-${i}`}
          className={cn(sharedClasses, getBoxClassesByValue(0))}
        />
      ))}
    </div>
  )
}

HardwareGrid.displayName = "HardwareGrid"

export default HardwareGrid
