import TrendUpChart from "@/components/svgs/trend-up-chart.svg"

import { cn } from "@/lib/utils"

type LoadingProps = Pick<
  React.HTMLAttributes<HTMLDivElement>,
  "className" | "children"
>

const Loading = ({ className, children }: LoadingProps) => (
  <div
    className={cn(
      "text-[250px] text-primary opacity-25 [&>svg]:motion-safe:animate-write-on-off",
      className
    )}
    role="status"
    aria-live="polite"
  >
    {children || <TrendUpChart strokeLinecap="round" />}
    <span className="sr-only">Loading...</span>
  </div>
)

Loading.displayName = "Loading"

export default Loading
