import * as React from "react"
import { cva, VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const cardVariants = cva("rounded-4xl p-6", {
  variants: {
    variant: {
      default: cn(
        "border bg-white/10 bg-gradient-to-b from-body/[0.06] to-body/[0.03] dark:bg-black/10",
        "space-y-6 md:space-y-12 md:px-12 md:py-8"
      ),
      borderGradient: "relative bg-background",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> &
    VariantProps<typeof cardVariants> & {
      gradientClasses?: string
    }
>(({ className, variant, gradientClasses, ...props }, ref) =>
  variant === "borderGradient" ? (
    <div
      ref={ref}
      className={cn(cardVariants({ variant }), className)}
      {...props}
    >
      <div
        className={cn(
          "absolute -inset-px z-[-2] rounded-[calc(2rem_+_1px)] bg-gradient-to-tl from-primary to-primary/10",
          gradientClasses
        )}
      />
      <div className="absolute -inset-px z-[-1] rounded-4xl bg-black/10" />
      <div className="space-y-6 md:space-y-12">{props.children}</div>
    </div>
  ) : (
    <div
      ref={ref}
      className={cn(cardVariants({ variant }), className)}
      {...props}
    />
  )
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-muted-foreground text-sm", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 py-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle }
