import Tooltip from "./Tooltip"

import { renderTimestamp } from "@/lib/date"

type RenderTimestampProps = React.HTMLAttributes<HTMLSpanElement> & {
  children: string
}
const Timestamp = ({ children, ...props }: RenderTimestampProps) => (
  <Tooltip trigger={<span {...props}>{renderTimestamp(children)}</span>}>
    {renderTimestamp(children, "UTC")}
  </Tooltip>
)

export default Timestamp
