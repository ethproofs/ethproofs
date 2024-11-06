"use client"

import Check from "@/components/svgs/check.svg"
import Copy from "@/components/svgs/copy.svg"

import { cn } from "@/lib/utils"

import { Button } from "./ui/button"

import { useClipboard } from "@/hooks/useClipboard"

type CopyButtonProps = React.HTMLAttributes<HTMLButtonElement> & {
  message: string
}
const CopyButton = ({ message, className }: CopyButtonProps) => {
  const { onCopy, hasCopied } = useClipboard()

  return (
    <Button
      size="icon"
      variant="ghost"
      className={cn("text-primary-dark", className)}
      onClick={() => onCopy(message)}
    >
      {hasCopied ? <Check /> : <Copy />}
    </Button>
  )
}

export default CopyButton
