"use client"

import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"

type ActiveLinkDecoratorProps = {
  match: string
  operand?: "includes" | "equals"
}
const ActiveLinkDecorator = ({
  match,
  operand = "equals",
}: ActiveLinkDecoratorProps) => {
  const pathname = usePathname()
  return (
    <span
      className={cn(
        "absolute bottom-0 hidden h-0.5 w-full bg-gradient-to-l from-primary from-30%",
        (operand === "includes"
          ? pathname.includes(match)
          : pathname === match) && "block"
      )}
    />
  )
}

export default ActiveLinkDecorator