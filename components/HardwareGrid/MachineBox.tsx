import * as PopoverPrimitive from "@radix-ui/react-popover"

import type { MachineBase } from "@/lib/types"

import MachineDetails from "../ui/MachineDetails"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"

const MachineBox = ({
  machine,
  className,
  style,
}: Pick<
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Trigger>,
  "style" | "className"
> & {
  machine: MachineBase
}) => {
  return (
    <Popover>
      <PopoverTrigger style={style} className={className} />
      <PopoverContent asChild>
        <MachineDetails machine={machine} />
      </PopoverContent>
    </Popover>
  )
}

export default MachineBox
