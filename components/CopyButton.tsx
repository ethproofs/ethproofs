"use client"

import ClipboardCheck from "@/components/svgs/clipboard-check.svg"
import Copy from "@/components/svgs/copy.svg"

import { cn } from "@/lib/utils"

import { Button } from "./ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip"

import { useClipboard } from "@/hooks/useClipboard"

type CopyButtonProps = React.HTMLAttributes<HTMLButtonElement> & {
  message: string
}
const CopyButton = ({ message, className }: CopyButtonProps) => {
  const { onCopy, hasCopied } = useClipboard()

  return (
    <TooltipProvider>
      <Tooltip open={hasCopied} delayDuration={0}>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className={cn("text-primary-dark", className)}
            onClick={onCopy(message)}
          >
            {hasCopied ? <ClipboardCheck /> : <Copy />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Copied!</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default CopyButton
