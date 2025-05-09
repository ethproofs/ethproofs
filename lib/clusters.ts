import type { ClusterMachineBase, MachineBase } from "./types"

export const hasPhysicalMachines = (clusterMachines: ClusterMachineBase[]) => {
  return clusterMachines.some((cm) => cm.machine_id !== null)
}

export const isMultiMachineCluster = (
  clusterMachines: ClusterMachineBase[]
) => {
  return (
    clusterMachines.length > 1 ||
    clusterMachines.some((config) => config.machine_count > 1)
  )
}
