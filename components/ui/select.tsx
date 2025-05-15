"use client"

import * as React from "react"
import { Check, ChevronDown, ChevronUp } from "lucide-react"
import * as SelectPrimitive from "@radix-ui/react-select"

import ArrowDropdown from "@/components/svgs/arrow-dropdown.svg"

import { cn } from "@/lib/utils"

const Select = SelectPrimitive.Root

const SelectGroup = SelectPrimitive.Group

const SelectValue = SelectPrimitive.Value

type SelectTriggerProps = React.ComponentProps<typeof SelectPrimitive.Trigger>

const SelectTrigger = ({
  className,
  children,
  ...props
}: SelectTriggerProps) => (
  <SelectPrimitive.Trigger
    className={cn(
      "flex h-fit w-full items-center justify-between gap-2 rounded-full border border-primary px-4 py-3 [&>svg]:shrink-0 [&>svg]:text-primary",
      "placeholder:text-muted-foreground focus:bg-background-highlight disabled:cursor-not-allowed disabled:opacity-50 data-[state=open]:bg-background-highlight [&>span]:line-clamp-1",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ArrowDropdown className="size-4" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
)
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

type SelectScrollUpButtonProps = React.ComponentProps<
  typeof SelectPrimitive.ScrollUpButton
>

const SelectScrollUpButton = ({
  className,
  ...props
}: SelectScrollUpButtonProps) => (
  <SelectPrimitive.ScrollUpButton
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
)
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

type SelectScrollDownButtonProps = React.ComponentProps<
  typeof SelectPrimitive.ScrollDownButton
>

const SelectScrollDownButton = ({
  className,
  ...props
}: SelectScrollDownButtonProps) => (
  <SelectPrimitive.ScrollDownButton
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
)
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName

type SelectContentProps = React.ComponentProps<typeof SelectPrimitive.Content>

const SelectContent = ({
  className,
  children,
  position = "popper",
  ...props
}: SelectContentProps) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      className={cn(
        "bg-background bg-gradient-to-b from-white/[0.06] to-white/[0.12]",
        "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-2xl border p-0 text-body shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
)
SelectContent.displayName = SelectPrimitive.Content.displayName

type SelectLabelProps = React.ComponentProps<typeof SelectPrimitive.Label>

const SelectLabel = ({ className, ...props }: SelectLabelProps) => (
  <SelectPrimitive.Label
    className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)}
    {...props}
  />
)
SelectLabel.displayName = SelectPrimitive.Label.displayName

type SelectItemProps = React.ComponentProps<typeof SelectPrimitive.Item>

const SelectItem = ({ className, children, ...props }: SelectItemProps) => (
  <SelectPrimitive.Item
    className={cn(
      "rounded-none border-b border-b-primary-border px-2 py-px last-of-type:border-b-transparent",
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-background-highlight focus:text-body data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>

    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
)
SelectItem.displayName = SelectPrimitive.Item.displayName

type SelectSeparatorProps = React.ComponentProps<
  typeof SelectPrimitive.Separator
>

const SelectSeparator = ({ className, ...props }: SelectSeparatorProps) => (
  <SelectPrimitive.Separator
    className={cn("bg-muted -mx-1 my-1 h-px", className)}
    {...props}
  />
)
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
