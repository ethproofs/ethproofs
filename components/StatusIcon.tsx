import * as React from "react"
import { cva, VariantProps } from "class-variance-authority"

import Box from "@/components/svgs/box.svg"
import BoxDashed from "@/components/svgs/box-dashed.svg"

import { cn } from "@/lib/utils"

const statusVariants = cva("self-center text-2xl text-body-secondary", {
  variants: {
    status: {
      queued: "",
      proving: "",
      proved: "text-primary",
    },
  },
})

const StatusIcon = React.forwardRef<
  HTMLOrSVGElement,
  React.HTMLAttributes<HTMLOrSVGElement> & VariantProps<typeof statusVariants>
>(({ className, status, ...props }, ref) => {
  const Icon = status === "queued" ? BoxDashed : Box
  return (
    <Icon
      ref={ref}
      strokeWidth="1"
      className={cn(statusVariants({ status, className }))}
      {...props}
    />
  )
})
StatusIcon.displayName = "StatusIcon"

export default StatusIcon
