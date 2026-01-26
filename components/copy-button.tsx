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

import { useClipboard } from "@/lib/hooks/ui/use-clipboard"

interface CopyButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  message: string
  iconClassName?: string
}

function CopyButton({ message, className, iconClassName }: CopyButtonProps) {
  const { onCopy, hasCopied } = useClipboard()

  return (
    <TooltipProvider>
      <Tooltip open={hasCopied} delayDuration={0}>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className={cn("text-primary-dark", className)}
            type="button"
            onClick={onCopy(message)}
          >
            {hasCopied ? (
              <ClipboardCheck className={cn("size-4", iconClassName)} />
            ) : (
              <Copy className={cn("size-4", iconClassName)} />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>copied!</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default CopyButton
