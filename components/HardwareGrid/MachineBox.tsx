import { ClusterDetails } from "@/lib/types"

import { cn } from "@/lib/utils"

import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"

import { getBoxColor } from "./utils"

const MachineBox = ({
  name,
  machines,
  totalGpuCount,
}: {
  name: string
  machines: ClusterDetails["machines"]
  totalGpuCount: number
}) => {
  return (
    <Popover>
      <PopoverTrigger>
        <div
          className={cn("size-6 rounded-[4px]", getBoxColor(totalGpuCount))}
        />
      </PopoverTrigger>
      <PopoverContent className="flex flex-col gap-y-3 p-4">
        <span className="block text-center font-mono text-lg uppercase text-body">
          {name}
        </span>
        {machines.map((machineDetails, idx) => (
          <div
            key={`details-${machineDetails.cpuModel}-${idx}`}
            className="flex flex-col items-center"
          >
            <span className="text-center font-mono text-lg text-primary">
              {machineDetails.cpuModel}
            </span>
            <div className="flex gap-x-3 text-center text-sm">
              <div className="flex min-w-24 flex-1 flex-col items-center">
                <div className="text-nowrap text-body-secondary">CPU cores</div>
                <div className="">{machineDetails.cpuCount}</div>
              </div>
              <div className="flex min-w-24 flex-1 flex-col items-center">
                <div className="text-nowrap text-body-secondary">GPU RAM</div>
                <div className="">{machineDetails.gpuRam}</div>
              </div>
            </div>
          </div>
        ))}
      </PopoverContent>
    </Popover>
  )
}

export default MachineBox
