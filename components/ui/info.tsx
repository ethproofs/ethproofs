import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

import { TooltipContentHeader } from "../ui/tooltip"

type LabelProps = {
  className?: string
  children?: React.ReactNode
  isSecondary?: boolean
}

const Label = ({ className, isSecondary, ...props }: LabelProps) => {
  const Comp = isSecondary ? "p" : TooltipContentHeader
  return <Comp className={cn("font-bold", className)} {...props} />
}
Label.displayName = "Label"

type DerivationProps = React.HTMLAttributes<HTMLDivElement>

const Derivation = ({ className, ...props }: DerivationProps) => (
  <div
    className={cn("rounded border bg-background px-3 py-2", className)}
    {...props}
  />
)
Derivation.displayName = "Derivation"

type DescriptionProps = React.HTMLAttributes<HTMLParagraphElement>

const Description = ({ className, ...props }: DescriptionProps) => (
  <p className={cn("text-body-secondary", className)} {...props} />
)
Description.displayName = "Description"

const termVariants = cva("", {
  variants: {
    type: {
      internal: "italic",
      codeTerm: "font-mono text-primary-light",
    },
  },
})

type TermProps = React.HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof termVariants>

const Term = ({ className, type, ...props }: TermProps) => (
  <span className={cn(termVariants({ type, className }))} {...props} />
)
Term.displayName = "Term"

export { Derivation, Description, Label, Term }
