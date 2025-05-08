import { ClusterMachineBase } from "./types"

export const hasPhysicalMachines = (clusterMachines: ClusterMachineBase[]) => {
  return clusterMachines.some((cm) => cm.machine_id !== null)
}
