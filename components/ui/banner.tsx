import * as React from "react"

import { cn } from "@/lib/utils"

const Banner = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex w-full items-center justify-between rounded-2xl border-[1.48px] border-primary-border bg-background-highlight px-6 py-4 text-body",
      className
    )}
    {...props}
  >
    {props.children}
  </div>
))
Banner.displayName = "Banner"

export { Banner }
