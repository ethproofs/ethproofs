import { ClusterMachineBase, MachineBase } from "@/lib/types"

import { cn, sumArray } from "@/lib/utils"

import { getMachineTotalGpuMemory } from "@/lib/machines"

type ClusterMachineSummaryProps = React.HTMLAttributes<HTMLDivElement> & {
  machines: (ClusterMachineBase & {
    machine: MachineBase
  })[]
}

const ClusterMachineSummary = ({
  machines,
  className,
  ...props
}: ClusterMachineSummaryProps) => (
  <div
    className={cn("flex flex-col items-center gap-y-6 text-center", className)}
    {...props}
  >
    <div className="flex w-fit flex-col items-center text-nowrap px-2 text-center">
      <span className="block text-nowrap text-sm text-body-secondary">
        total machines
      </span>
      <span className="block font-mono text-2xl font-bold text-body">
        {sumArray(machines.map((m) => m.machine_count))}
      </span>
    </div>
    <div className="grid grid-cols-2 place-items-center gap-x-3 gap-y-4 text-center">
      <div className="flex w-full flex-col items-center text-nowrap text-center">
        <span className="block text-sm text-body-secondary">GPUs</span>
        <span className="block font-mono text-xl text-body">
          {sumArray(
            machines.map((m) => sumArray(m.machine.gpu_count) * m.machine_count)
          )}
        </span>
      </div>
      <div className="flex w-full flex-col items-center text-nowrap text-center">
        <span className="block text-sm text-body-secondary">GPU RAM</span>
        <span className="block font-mono text-xl text-body">
          {sumArray(
            machines.map(
              (m) => getMachineTotalGpuMemory(m.machine) * m.machine_count
            )
          )}{" "}
          GB
        </span>
      </div>
      <div className="flex flex-col items-center text-nowrap text-center">
        <span className="block text-sm text-body-secondary">CPU cores</span>
        <span className="block font-mono text-xl text-body">
          {sumArray(
            machines.map((m) => (m.machine.cpu_cores ?? 0) * m.machine_count)
          )}
        </span>
      </div>
      <div className="flex flex-col items-center text-nowrap text-center">
        <span className="block text-sm text-body-secondary">CPU RAM</span>
        <span className="block font-mono text-xl text-body">
          {sumArray(
            machines.map(
              (m) => sumArray(m.machine.memory_size_gb) * m.machine_count
            )
          )}{" "}
          GB
        </span>
      </div>
    </div>
  </div>
)

ClusterMachineSummary.displayName = "ClusterMachineSummary"

export default ClusterMachineSummary
