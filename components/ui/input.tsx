import * as React from "react"

import { cn } from "@/lib/utils"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  ref?: React.Ref<HTMLInputElement>
}

const Input = ({ className, type, ...props }: InputProps) => (
  <input
    type={type}
    className={cn(
      "flex h-fit w-full gap-2 rounded-full border border-primary bg-background-highlight px-4 py-3 text-xs ring-offset-background",
      "[&>svg]:shrink-0 [&>svg]:text-primary",
      "placeholder:text-body-secondary disabled:cursor-not-allowed disabled:opacity-50",
      "focus-visible:shadow-inner focus-visible:outline-none",
      "file:border-0 file:bg-transparent file:text-sm file:font-semibold file:text-body",
      className
    )}
    {...props}
  />
)
Input.displayName = "Input"

export { Input }
