import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  cn(
    // Sizing and positioning classes:
    "inline-flex gap-4 items-center justify-center rounded-full border border-solid transition [&>svg]:flex-shrink-0",
    // Base default styling is "outline" pattern, primary color for text, border matches, no bg
    "text-primary border-current",
    // Hover: Default hover adds box-shadow, text (border) to --primary-hover
    "hover:bg-primary-border"
  ),
  {
    variants: {
      variant: {
        solid: cn(
          "text-primary-border bg-primary !border-transparent",
          "hover:!text-primary-dark hover:!bg-primary-light" // Hover
        ),
        outline: "",
        ghost: "border-transparent hover:shadow-none",
        link: "border-transparent hover:shadow-none underline py-0 px-1 active:text-primary",
      },
      size: {
        lg: "py-2 px-[1.375rem]",
        md: "text-sm py-1 px-[1.125rem]",
        sm: "px-3 py-1 text-xs",
        icon: "p-0.5 h-6 w-6",
      },
    },
    defaultVariants: {
      variant: "solid",
      size: "md",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
