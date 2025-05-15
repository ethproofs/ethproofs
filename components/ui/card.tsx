import * as React from "react"

import { cn } from "@/lib/utils"

type CardProps = React.HTMLAttributes<HTMLDivElement>

const Card = ({ className, ...props }: CardProps) => (
  <div
    className={cn(
      "space-y-6 md:space-y-12",
      "rounded-3xl p-6 shadow-md md:px-12 md:py-8",
      "relative before:absolute before:inset-0 before:-z-[2] before:rounded-3xl before:bg-gradient-to-tl before:from-primary before:to-primary/10",
      "after:absolute after:inset-px after:-z-[1] after:rounded-[calc(1.5rem_-_1px)] after:bg-background after:bg-gradient-to-b after:from-background after:to-background-accent/25",

      className
    )}
    {...props}
  >
    {props.children}
  </div>
)
Card.displayName = "Card"

type CardHeaderProps = React.HTMLAttributes<HTMLDivElement>

const CardHeader = ({ className, ...props }: CardHeaderProps) => (
  <div className={cn("flex flex-col space-y-1.5", className)} {...props} />
)
CardHeader.displayName = "CardHeader"

type CardTitleProps = React.HTMLAttributes<HTMLDivElement>

const CardTitle = ({ className, ...props }: CardTitleProps) => (
  <div
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props}
  />
)
CardTitle.displayName = "CardTitle"

type CardDescriptionProps = React.HTMLAttributes<HTMLDivElement>

const CardDescription = ({ className, ...props }: CardDescriptionProps) => (
  <div className={cn("text-muted-foreground text-sm", className)} {...props} />
)
CardDescription.displayName = "CardDescription"

type CardContentProps = React.HTMLAttributes<HTMLDivElement>

const CardContent = ({ className, ...props }: CardContentProps) => (
  <div className={className} {...props} />
)
CardContent.displayName = "CardContent"

type CardFooterProps = React.HTMLAttributes<HTMLDivElement>

const CardFooter = ({ className, ...props }: CardFooterProps) => (
  <div className={cn("flex items-center py-4", className)} {...props} />
)
CardFooter.displayName = "CardFooter"

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle }
