import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip"

import { formatShortDate, formatTimeAgo, renderTimestamp } from "@/lib/date"

type RenderTimestampProps = React.HTMLAttributes<HTMLSpanElement> & {
  children: string
}
const Timestamp = ({ children, ...props }: RenderTimestampProps) => (
  <Tooltip>
    <TooltipTrigger>
      <span {...props}>
        {formatTimeAgo(children)} ({formatShortDate(children)})
      </span>
    </TooltipTrigger>
    <TooltipContent className="text-xs">
      {renderTimestamp(children, "UTC")}
    </TooltipContent>
  </Tooltip>
)

export default Timestamp
