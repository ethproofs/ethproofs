import * as React from "react"
import { cva, VariantProps } from "class-variance-authority"
import { Box, Layers } from "lucide-react"

import { cn } from "@/lib/utils"

const statusVariants = cva("self-center text-2xl", {
  variants: {
    status: {
      queued: "text-body-secondary",
      proving: "text-body-secondary",
      proved: "text-primary",
    },
  },
})

const StatusIcon = React.forwardRef<
  SVGSVGElement,
  React.HTMLAttributes<SVGSVGElement> & VariantProps<typeof statusVariants>
>(({ className, status, ...props }, ref) => {
  const Icon = status === "queued" ? Layers : Box
  return (
    <Icon
      ref={ref}
      className={cn(statusVariants({ status, className }))}
      {...props}
    />
  )
})
StatusIcon.displayName = "StatusIcon"

export default StatusIcon
