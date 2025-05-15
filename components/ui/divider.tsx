import * as React from "react"

import { cn } from "@/lib/utils"

type DividerProps = Omit<React.HTMLAttributes<HTMLDivElement>, "children">

const Divider = ({ className, ...props }: DividerProps) => (
  <div
    className={cn("h-px w-full bg-gradient-to-r from-primary", className)}
    {...props}
  />
)
Divider.displayName = "Divider"

export { Divider }
