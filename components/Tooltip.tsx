"use client"

import { ComponentProps, Fragment, ReactNode, useEffect } from "react"
import { Portal } from "@radix-ui/react-portal"

import {
  Popover as UIPopover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { cn, isMobile } from "@/lib/utils"

import { useDisclosure } from "@/hooks/useDisclosure"

export type TooltipProps = ComponentProps<typeof UIPopover> & {
  trigger: ReactNode
  children?: ReactNode
  className?: string
  onBeforeOpen?: () => void
  container?: HTMLElement | null
}

const Tooltip = ({
  trigger,
  children,
  onBeforeOpen,
  container,
  className,
  ...props
}: TooltipProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  // Close the popover when the user scrolls.
  // This is useful for mobile devices where the popover is open by clicking the
  // trigger, not hovering.
  useEffect(() => {
    let originalPosition = 0

    const handleScroll = () => {
      const delta = window.scrollY - originalPosition

      // Close the popover if the user scrolls more than 80px
      if (isOpen && Math.abs(delta) > 80) {
        onClose()
      }
    }

    // Add event listener when the popover is open
    if (isOpen) {
      window.addEventListener("scroll", handleScroll)
      originalPosition = window.scrollY
    }

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [isOpen, onClose])

  const handleOpen = () => {
    onBeforeOpen?.()
    onOpen()
  }

  const handleOpenChange = (open: boolean) => {
    if (open) {
      handleOpen()
    } else {
      onClose()
    }
  }

  // Use Popover on mobile devices since the user can't hover
  const Component = isMobile() ? UIPopover : UITooltip
  const Provider = isMobile() ? Fragment : TooltipProvider
  const Trigger = isMobile() ? PopoverTrigger : TooltipTrigger
  const Content = isMobile() ? PopoverContent : TooltipContent

  return (
    <Provider>
      <Component
        open={isOpen}
        onOpenChange={handleOpenChange}
        delayDuration={200}
        {...props}
      >
        <Trigger className="focus-visible:outline-primary-hover focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
          {trigger}
        </Trigger>
        <Portal container={container}>
          <Content
            side="top"
            sideOffset={2}
            className={cn("max-w-80 px-5 text-sm", className)}
            data-testid="tooltip-popover"
          >
            {children}
          </Content>
        </Portal>
      </Component>
    </Provider>
  )
}

export default Tooltip
