import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "@radix-ui/react-slot"

import { cn } from "@/lib/utils"

import Link, { LinkProps } from "./link"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "aspect-square h-7 w-7", // changed default "h-10 w-10"
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
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

type ButtonLinkProps = LinkProps &
  Pick<
    ButtonProps,
    "size" | "variant" | "children" | "className" | "disabled"
  > & {
    buttonProps?: Omit<ButtonProps, "size" | "variant">
  }

const ButtonLink = React.forwardRef<HTMLAnchorElement, ButtonLinkProps>(
  ({ size, variant, buttonProps, children, className, ...linkProps }, ref) => {
    return (
      <Button asChild size={size} variant={variant} {...buttonProps}>
        <Link
          hideArrow
          ref={ref}
          className={cn(
            "font-body font-bold no-underline hover:no-underline",
            className
          )}
          {...linkProps}
        >
          {children}
        </Link>
      </Button>
    )
  }
)
ButtonLink.displayName = "ButtonLink"

export { Button, ButtonLink, buttonVariants }
