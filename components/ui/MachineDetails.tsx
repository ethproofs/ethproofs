import type { MachineBase } from "@/lib/types"

import { cn, sumArray } from "@/lib/utils"

type MachineDetailsProps = React.HTMLAttributes<HTMLDivElement> & {
  machine: MachineBase
}
const MachineDetails = ({
  machine,
  className,
  ...props
}: MachineDetailsProps) => (
  <div className={cn("flex flex-col gap-y-3 p-4", className)} {...props}>
    <span className="block text-center font-mono text-lg text-primary">
      {machine.cpu_model}
    </span>
    <div className="flex flex-col items-center gap-y-3">
      <div className="flex gap-x-3 text-center text-sm">
        <div className="flex flex-1 flex-col items-center p-2">
          <div className="text-nowrap text-body-secondary">CPU cores</div>
          <div className="">{machine.cpu_cores}</div>
        </div>
        <div className="flex flex-1 flex-col items-center p-2">
          <div className="text-nowrap text-body-secondary">CPU RAM</div>
          <div className="">
            <div className="">
              {machine.memory_size_gb?.reduce(
                (total, size, i) =>
                  total + size * (machine.memory_count?.[i] || 0),
                0
              ) ?? 0}{" "}
              GB
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-y-3">
        {machine.gpu_models?.map((gpuModel, index) => {
          const gpuCount = machine.gpu_count?.[index] || 0
          const gpuMemory = machine.gpu_memory_gb?.[index] || 0

          return (
            <div key={`${gpuModel}-${index}`}>
              <div className="text-center font-mono text-lg text-primary">
                {gpuModel}
              </div>

              <div className="flex gap-x-3 text-center text-sm">
                <div className="flex flex-1 flex-col items-center p-2">
                  <div className="text-nowrap text-body-secondary">GPUs</div>
                  <div>{gpuCount}</div>
                </div>
                <div className="flex flex-1 flex-col items-center p-2">
                  <div className="text-nowrap text-body-secondary">GPU RAM</div>
                  <div className="">{gpuMemory * gpuCount} GB</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  </div>
)

MachineDetails.displayName = "MachineDetails"

export default MachineDetails
