"use client"

import * as React from "react"
import { Check, ChevronRight, Circle } from "lucide-react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"

import { cn } from "@/lib/utils"

const DropdownMenu = DropdownMenuPrimitive.Root

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger

const DropdownMenuGroup = DropdownMenuPrimitive.Group

const DropdownMenuPortal = DropdownMenuPrimitive.Portal

const DropdownMenuSub = DropdownMenuPrimitive.Sub

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup

type DropdownMenuSubTriggerProps = React.ComponentProps<
  typeof DropdownMenuPrimitive.SubTrigger
> & {
  inset?: boolean
}

const DropdownMenuSubTrigger = ({
  className,
  inset,
  children,
  ...props
}: DropdownMenuSubTriggerProps) => (
  <DropdownMenuPrimitive.SubTrigger
    className={cn(
      "flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-background-highlight data-[state=open]:bg-background-highlight [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      inset && "pl-8",
      className
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto" />
  </DropdownMenuPrimitive.SubTrigger>
)
DropdownMenuSubTrigger.displayName =
  DropdownMenuPrimitive.SubTrigger.displayName

type DropdownMenuSubContentProps = React.ComponentProps<
  typeof DropdownMenuPrimitive.SubContent
>

const DropdownMenuSubContent = ({
  className,
  ...props
}: DropdownMenuSubContentProps) => (
  <DropdownMenuPrimitive.SubContent
    className={cn(
      "bg-popover text-popover-foreground z-50 min-w-[8rem] overflow-hidden rounded-md border border-primary-border p-1 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
)
DropdownMenuSubContent.displayName =
  DropdownMenuPrimitive.SubContent.displayName

type DropdownMenuContentProps = React.ComponentProps<
  typeof DropdownMenuPrimitive.Content
>

const DropdownMenuContent = ({
  className,
  sideOffset = 4,
  ...props
}: DropdownMenuContentProps) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      sideOffset={sideOffset}
      className={cn(
        "z-50 min-w-[8rem] space-y-1 overflow-hidden rounded-2xl p-6 text-body shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        "relative before:absolute before:inset-0 before:-z-[2] before:rounded-2xl before:bg-gradient-to-tl before:from-primary before:to-primary/10",
        "after:absolute after:inset-px after:-z-[1] after:rounded-[calc(1rem_-_1px)] after:bg-background-highlight after:bg-gradient-to-b after:from-background after:to-background-accent/25",
        className
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
)
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName

type DropdownMenuItemProps = React.ComponentProps<
  typeof DropdownMenuPrimitive.Item
> & {
  inset?: boolean
}

const DropdownMenuItem = ({
  className,
  inset,
  ...props
}: DropdownMenuItemProps) => (
  <DropdownMenuPrimitive.Item
    className={cn(
      "rounded-none border-b border-b-primary-border px-2 py-px last-of-type:border-b-transparent",
      "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-background-highlight focus:text-body data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      inset && "pl-8",
      className
    )}
    {...props}
  />
)
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName

type DropdownMenuCheckboxItemProps = React.ComponentProps<
  typeof DropdownMenuPrimitive.CheckboxItem
>

const DropdownMenuCheckboxItem = ({
  className,
  children,
  checked,
  ...props
}: DropdownMenuCheckboxItemProps) => (
  <DropdownMenuPrimitive.CheckboxItem
    className={cn(
      "relative flex cursor-default select-none items-center rounded py-1 pe-2 ps-8 text-sm outline-none transition-colors focus:bg-background-highlight focus:text-body data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute start-1.5 flex size-4 items-center justify-center rounded border border-primary">
      <DropdownMenuPrimitive.ItemIndicator>
        <Check
          className="size-3 text-primary"
          strokeLinejoin="miter"
          strokeLinecap="square"
          strokeWidth="4px"
        />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
)
DropdownMenuCheckboxItem.displayName =
  DropdownMenuPrimitive.CheckboxItem.displayName

type DropdownMenuRadioItemProps = React.ComponentProps<
  typeof DropdownMenuPrimitive.RadioItem
>

const DropdownMenuRadioItem = ({
  className,
  children,
  ...props
}: DropdownMenuRadioItemProps) => (
  <DropdownMenuPrimitive.RadioItem
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-background-highlight focus:text-body data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Circle className="h-2 w-2 fill-current" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>
)
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName

type DropdownMenuLabelProps = React.ComponentProps<
  typeof DropdownMenuPrimitive.Label
> & {
  inset?: boolean
}

const DropdownMenuLabel = ({
  className,
  inset,
  ...props
}: DropdownMenuLabelProps) => (
  <DropdownMenuPrimitive.Label
    className={cn(
      "px-2 py-1.5 text-sm font-semibold",
      inset && "pl-8",
      className
    )}
    {...props}
  />
)
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName

type DropdownMenuSeparatorProps = React.ComponentProps<
  typeof DropdownMenuPrimitive.Separator
>

const DropdownMenuSeparator = ({
  className,
  ...props
}: DropdownMenuSeparatorProps) => (
  <DropdownMenuPrimitive.Separator
    className={cn("my-3 h-px bg-background-highlight", className)}
    {...props}
  />
)
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName

const DropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn("ml-auto text-xs tracking-widest opacity-60", className)}
      {...props}
    />
  )
}
DropdownMenuShortcut.displayName = "DropdownMenuShortcut"

export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
}
