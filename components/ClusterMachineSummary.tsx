import type { ClusterDetails } from "@/lib/types"

import { cn, sumArray } from "@/lib/utils"

type ClusterMachineSummaryProps = React.HTMLAttributes<HTMLDivElement> & {
  clusterDetails: ClusterDetails
}
const ClusterMachineSummary = ({
  clusterDetails,
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
        {sumArray(clusterDetails.machines.map((m) => m.count))}
      </span>
    </div>
    <div className="grid grid-cols-2 place-items-center gap-x-3 gap-y-4 text-center">
      <div className="flex w-full flex-col items-center text-nowrap text-center">
        <span className="block text-sm text-body-secondary">GPUs</span>
        <span className="block font-mono text-xl text-body">
          {sumArray(
            clusterDetails.machines.map((m) => sumArray(m.gpuCount) * m.count)
          )}
        </span>
      </div>
      <div className="flex w-full flex-col items-center text-nowrap text-center">
        <span className="block text-sm text-body-secondary">GPU RAM</span>
        <span className="block font-mono text-xl text-body">
          {sumArray(
            clusterDetails.machines.map((m) => sumArray(m.gpuRam) * m.count)
          )}{" "}
          GB
        </span>
      </div>
      <div className="flex flex-col items-center text-nowrap text-center">
        <span className="block text-sm text-body-secondary">CPU cores</span>
        <span className="block font-mono text-xl text-body">
          {sumArray(clusterDetails.machines.map((m) => m.cpuCount * m.count))}
        </span>
      </div>
      <div className="flex flex-col items-center text-nowrap text-center">
        <span className="block text-sm text-body-secondary">CPU RAM</span>
        <span className="block font-mono text-xl text-body">
          {sumArray(clusterDetails.machines.map((m) => m.cpuRam * m.count))} GB
        </span>
      </div>
    </div>
  </div>
)

ClusterMachineSummary.displayName = "ClusterMachineSummary"

export default ClusterMachineSummary
