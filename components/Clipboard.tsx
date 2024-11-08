"use client"

import { Button } from "@/components/ui/button"
import { useClipboard } from "@/hooks/useClipboard"
import { cn } from "@/lib/utils"

type ClipboardProps = React.HTMLAttributes<HTMLButtonElement> & {
  message?: string
}

const Clipboard = ({ message, children, className }: ClipboardProps) => {
  const { onCopy, hasCopied } = useClipboard()
  const copyMessage = message || String(children)
  return (
    <div className="relative text-lg">
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
          "absolute inset-0",
          hasCopied ? "scale-y-100" : "scale-y-0"
        )}
      >
        Copied!
      </div>
    </div>
  )
}

export default Clipboard
