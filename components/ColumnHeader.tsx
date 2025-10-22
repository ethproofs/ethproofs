import * as Info from "@/components/ui/info"
import { MetricInfo } from "@/components/ui/metric"

import { cn } from "@/lib/utils"

type ColumnHeaderProps = React.HTMLAttributes<HTMLDivElement> & {
  label: React.ReactNode
}
const ColumnHeader = ({ label, children, className }: ColumnHeaderProps) => (
  <div className={cn("whitespace-nowrap", className)}>
    <MetricInfo
      className="space-y-3 whitespace-normal"
      label={<span className="lowercase">{label}</span>}
    >
      <Info.Label className="lowercase">{label}</Info.Label>
      {children}
    </MetricInfo>
  </div>
)

export { ColumnHeader }
