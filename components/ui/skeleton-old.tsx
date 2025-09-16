import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("z-50 animate-pulse rounded-md bg-placeholder", className)}
      {...props}
    />
  )
}

export { Skeleton }
