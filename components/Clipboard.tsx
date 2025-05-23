"use client"

import ClipboardCheck from "@/components/svgs/clipboard-check.svg"
import { Button } from "@/components/ui/button"

import { cn } from "@/lib/utils"

import { useClipboard } from "@/hooks/useClipboard"

type ClipboardProps = React.HTMLAttributes<HTMLButtonElement> & {
  message?: string
  timeout?: number
}

const Clipboard = ({
  message,
  children,
  className,
  timeout = 500,
}: ClipboardProps) => {
  const { onCopy, hasCopied } = useClipboard({ timeout })
  const copyMessage = message || String(children)
  return (
    <div className="relative inline-block">
      <Button
        className={cn(className, hasCopied ? "scale-y-0" : "scale-y-100")}
        onClick={onCopy(copyMessage)}
        variant="text"
        size="text"
        disabled={hasCopied}
      >
        {children}
      </Button>
      <div
        className={cn(
          className,
          "absolute inset-0 grid place-items-center",
          hasCopied ? "scale-y-100" : "scale-y-0"
        )}
      >
        <ClipboardCheck />
      </div>
    </div>
  )
}

export default Clipboard
