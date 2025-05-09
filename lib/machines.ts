import { MachineBase } from "./types"
import { sumArray } from "./utils"

export const getMachineTotalGpuMemory = (machine: MachineBase) => {
  return sumArray(
    machine.gpu_models?.map((_, index) => {
      const gpuCount = machine.gpu_count?.[index] || 0
      const gpuMemory = machine.gpu_memory_gb?.[index] || 0
      return gpuMemory * gpuCount
    })
  )
}
