import { ClusterDetails } from "@/lib/types"

import { cn } from "@/lib/utils"

import MachineDetails from "../ui/MachineDetails"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"

const MachineBox = ({
  machine,
  className,
}: {
  machine: ClusterDetails["machines"][number]
  className?: string
}) => {
  return (
    <Popover>
      <PopoverTrigger>
        <div className={cn("size-6 rounded-[4px]", className)} />
      </PopoverTrigger>
      <PopoverContent asChild>
        <MachineDetails machine={machine} />
      </PopoverContent>
    </Popover>
  )
}

export default MachineBox
