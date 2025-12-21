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
            type="button"
            onClick={onCopy(message)}
          >
            {hasCopied ? (
              <ClipboardCheck className="size-4" />
            ) : (
              <Copy className="size-4" />
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
