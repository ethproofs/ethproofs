import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"

import { renderTimestamp } from "@/lib/date"

type RenderTimestampProps = React.HTMLAttributes<HTMLSpanElement> & {
  children: string
}
const Timestamp = ({ children, ...props }: RenderTimestampProps) => (
  <Popover>
    <PopoverTrigger>
      <span {...props}>{renderTimestamp(children)}</span>
    </PopoverTrigger>
    <PopoverContent>{renderTimestamp(children, "UTC")}</PopoverContent>
  </Popover>
)

export default Timestamp
