import * as React from "react"

import { cn } from "@/lib/utils"

const Divider = React.forwardRef<
  HTMLDivElement,
  Omit<React.HTMLAttributes<HTMLDivElement>, "children">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("h-px w-full bg-gradient-to-r from-primary", className)}
    {...props}
  />
))
Divider.displayName = "Divider"

export { Divider }
