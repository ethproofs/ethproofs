"use client"

import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { useClipboard } from "@/hooks/useClipboard"
import { Button } from "@/components/ui/button"

type ClipboardProps = React.HTMLAttributes<HTMLButtonElement> & {
  message: string
}

const Clipboard = ({ message, children, className }: ClipboardProps) => {
  const { onCopy, hasCopied } = useClipboard()
  return (
    <div className="relative text-lg">
      <Button
        className={cn(className, hasCopied ? "scale-y-0" : "scale-y-100")}
        onClick={onCopy(message)}
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
