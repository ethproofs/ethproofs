import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import Link, { LinkProps } from "next/link"
import { Slot } from "@radix-ui/react-slot"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  cn(
    // Sizing and positioning classes:
    "inline-flex gap-4 items-center justify-center rounded-full border border-solid transition [&>svg]:shrink-0",
    // Base default styling is "outline" pattern, primary color for text, border matches, no bg
    "text-primary border-current",
    // Hover: Default hover changes bg to --background-active
    "hover:bg-background-active",
    // isSecondary: Switch text (border) to --body instead of --primary
    "[&[data-secondary='true']]:text-body"
  ),
  {
    variants: {
      variant: {
        solid: cn(
          "text-background bg-primary !border-transparent",
          "hover:bg-primary-light dark:hover:bg-green-300"
        ),
        outline: "",
        ghost: "border-transparent hover:shadow-none",
        link: "border-transparent hover:shadow-none underline py-0 px-1 active:text-primary",
        text: "border-transparent hover:shadow-none text-auto hover:bg-transparent",
      },
      size: {
        lg: "py-2 px-[1.375rem]",
        md: "text-sm py-1 px-[1.125rem]",
        sm: "px-3 py-1 text-xs",
        icon: "p-0.5 h-6 w-6",
        text: "p-0",
      },
    },
    defaultVariants: {
      variant: "solid",
      size: "md",
    },
  }
)

type ButtonVariantProps = VariantProps<typeof buttonVariants>

export const checkIsSecondary = ({
  variant,
  isSecondary,
}: {
  variant: ButtonVariantProps["variant"]
  isSecondary: boolean
}) => {
  // These two variants do not have secondary styling, so prevent overrides
  return {
    "data-secondary":
      !["solid", "link"].includes(variant || "solid") && isSecondary,
  }
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  /**
   * Custom theme prop. If true, `body` color is used instead of
   * `primary` color in the theming.
   *
   * `NOTE`: Does not apply to the `Solid` or `Link` variants
   */
  isSecondary?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      isSecondary = false,
      asChild = false,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...checkIsSecondary({
          variant,
          isSecondary,
        })}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

type ButtonLinkProps = LinkProps &
  Pick<
    ButtonProps,
    "size" | "variant" | "isSecondary" | "children" | "className"
  > & {
    buttonProps?: Omit<ButtonProps, "size" | "variant">
  }

const ButtonLink = React.forwardRef<HTMLAnchorElement, ButtonLinkProps>(
  (
    {
      size,
      variant,
      isSecondary,
      buttonProps,
      children,
      className,
      ...linkProps
    },
    ref
  ) => {
    return (
      <Button
        asChild
        size={size}
        variant={variant}
        isSecondary={isSecondary}
        {...buttonProps}
      >
        <Link
          ref={ref}
          className={cn("no-underline hover:no-underline", className)}
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
