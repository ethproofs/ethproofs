import { MachineBase } from "@/lib/types"

import { cn } from "@/lib/utils"

import MachineDetails from "../ui/MachineDetails"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"

const MachineBox = ({
  machine,
  className,
}: {
  machine: MachineBase
  className?: string
}) => {
  return (
    <Popover>
      <PopoverTrigger className={cn("size-6 rounded-[4px]", className)} />
      <PopoverContent asChild>
        <MachineDetails machine={machine} />
      </PopoverContent>
    </Popover>
  )
}

export default MachineBox
