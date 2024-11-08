/* eslint-disable simple-import-sort/imports */

"use client"

import ClipboardCheck from "@/components/svgs/clipboard-check.svg"

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
