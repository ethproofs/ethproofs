import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

import { TooltipContentHeader } from "./tooltip"

type LabelProps = {
  className?: string
  children?: React.ReactNode
  isSecondary?: boolean
}

const Label = React.forwardRef<
  HTMLDivElement | HTMLParagraphElement,
  LabelProps
>(({ className, isSecondary, ...props }, ref) => {
  const Comp = isSecondary ? "p" : TooltipContentHeader
  return <Comp ref={ref} className={cn("font-bold", className)} {...props} />
})
Label.displayName = "Label"

const Derivation = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("rounded border bg-background px-3 py-2", className)}
    {...props}
  />
))
Derivation.displayName = "Derivation"

const Description = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-body-secondary", className)} {...props} />
))
Description.displayName = "Description"

const termVariants = cva("", {
  variants: {
    type: {
      internal: "italic",
      codeTerm: " text-primary-light",
    },
  },
})

const Term = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof termVariants>
>(({ className, type, ...props }, ref) => (
  <span
    ref={ref}
    className={cn(termVariants({ type, className }))}
    {...props}
  />
))
Term.displayName = "Term"

export { Derivation, Description, Label, Term }
