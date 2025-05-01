import { ClusterDetails } from "@/lib/types"

import { cn } from "@/lib/utils"

import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"

const MachineBox = ({
  name,
  machine,
  className,
}: {
  name: string
  machine: ClusterDetails["machines"][number]
  className?: string
}) => {
  return (
    <Popover>
      <PopoverTrigger>
        <div className={cn("size-6 rounded-[4px]", className)} />
      </PopoverTrigger>
      <PopoverContent className="flex flex-col gap-y-3 p-4">
        <span className="block text-center font-mono text-lg uppercase text-body">
          {name}
        </span>
        <div className="flex flex-col items-center">
          <span className="text-center font-mono text-lg text-primary">
            {machine.cpuModel}
          </span>
          <div className="flex gap-x-3 text-center text-sm">
            <div className="flex min-w-24 flex-1 flex-col items-center">
              <div className="text-nowrap text-body-secondary">CPU cores</div>
              <div className="">{machine.cpuCount}</div>
            </div>
            <div className="flex min-w-24 flex-1 flex-col items-center">
              <div className="text-nowrap text-body-secondary">GPU RAM</div>
              <div className="">{machine.gpuRam} GB</div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default MachineBox
