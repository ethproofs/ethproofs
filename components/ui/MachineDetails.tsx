import type { ClusterDetails } from "@/lib/types"

import { cn } from "@/lib/utils"

type MachineDetailsProps = React.HTMLAttributes<HTMLDivElement> & {
  machine: ClusterDetails["machines"][number]
}
const MachineDetails = ({
  machine,
  className,
  ...props
}: MachineDetailsProps) => (
  <div className={cn("flex flex-col gap-y-3 p-4", className)} {...props}>
    <span className="block text-center font-mono text-lg uppercase text-primary">
      {machine.cpuModel}
    </span>
    <div className="flex flex-col items-center gap-y-3">
      <div className="flex gap-x-3 text-center text-sm">
        <div className="flex min-w-24 flex-1 flex-col items-center">
          <div className="text-nowrap text-body-secondary">CPU cores</div>
          <div className="">{machine.cpuCount}</div>
        </div>
        <div className="flex min-w-24 flex-1 flex-col items-center">
          <div className="text-nowrap text-body-secondary">CPU RAM</div>
          <div className="">{machine.cpuRam} GB</div>
        </div>
      </div>
      <div className="flex flex-col gap-y-3">
        {machine.gpuModels.map((gpuModel, index) => (
          <div key={gpuModel}>
            <div className="text-center font-mono text-lg text-primary">
              {gpuModel}
            </div>

            <div className="flex gap-x-3 text-center text-sm">
              <div className="flex min-w-24 flex-1 flex-col items-center">
                <div className="text-nowrap text-body-secondary">GPUs</div>
                <div className="">{machine.gpuCount[index]}</div>
              </div>
              <div className="flex min-w-24 flex-1 flex-col items-center">
                <div className="text-nowrap text-body-secondary">GPU RAM</div>
                <div className="">{machine.gpuRam[index]} GB</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)

MachineDetails.displayName = "MachineDetails"

export default MachineDetails
