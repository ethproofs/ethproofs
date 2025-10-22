import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"

import { formatShortDate, formatTimeAgo, renderTimestamp } from "@/lib/date"

type RenderTimestampProps = React.HTMLAttributes<HTMLSpanElement> & {
  children: string
}
const Timestamp = ({ children, ...props }: RenderTimestampProps) => (
  <Popover>
    <PopoverTrigger>
      <span {...props}>
        {formatTimeAgo(children)} ({formatShortDate(children)})
      </span>
    </PopoverTrigger>
    <PopoverContent>{renderTimestamp(children, "UTC")}</PopoverContent>
  </Popover>
)

export default Timestamp
