"use client"

import { ClipboardCheck, Copy } from "lucide-react"

import { cn } from "@/lib/utils"

import { Button } from "./ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip"

import { useClipboard } from "@/hooks/useClipboard"

interface CopyButtonProps {
  message: string
  className?: string
}
export function CopyButton({ message, className }: CopyButtonProps) {
  const { onCopy, hasCopied } = useClipboard()

  return (
    <TooltipProvider>
      <Tooltip open={hasCopied} delayDuration={0}>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className={cn("", className)}
            type="button"
            onClick={onCopy(message)}
          >
            {hasCopied ? <ClipboardCheck /> : <Copy />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <span className="text-xs">copied!</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
