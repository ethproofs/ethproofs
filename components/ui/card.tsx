import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-4xl border bg-gradient-to-b from-body/[0.06] to-body/[0.03] p-8",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

export { Card }
