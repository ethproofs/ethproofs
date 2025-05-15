"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"

import { cn } from "@/lib/utils"

const Accordion = AccordionPrimitive.Root

type AccordionItemProps = React.ComponentProps<typeof AccordionPrimitive.Item>

const AccordionItem = ({ className, ...props }: AccordionItemProps) => (
  <AccordionPrimitive.Item
    className={cn("border-b border-background-active", className)}
    {...props}
  />
)
AccordionItem.displayName = "AccordionItem"

type AccordionTriggerProps = React.ComponentProps<
  typeof AccordionPrimitive.Trigger
>

const AccordionTrigger = ({
  className,
  children,
  ...props
}: AccordionTriggerProps) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      className={cn(
        "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="ms-auto size-4 shrink-0 transition-transform duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
)
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName

type AccordionContentProps = React.ComponentProps<
  typeof AccordionPrimitive.Content
>

const AccordionContent = ({
  className,
  children,
  ...props
}: AccordionContentProps) => (
  <AccordionPrimitive.Content
    className="col-span-full w-full overflow-hidden bg-gradient-to-t from-background-active/20 text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn("pb-4 pt-0", className)}>{children}</div>
  </AccordionPrimitive.Content>
)
AccordionContent.displayName = AccordionPrimitive.Content.displayName

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger }
