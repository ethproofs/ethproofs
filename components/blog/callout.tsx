import { cva } from "class-variance-authority"
import type { ReactNode } from "react"

const calloutVariants = cva("my-6 flex gap-3 rounded-lg border p-4", {
  variants: {
    color: {
      grey: "border-muted bg-muted/30",
      blue: "border-info/50 bg-info/10",
    },
  },
  defaultVariants: {
    color: "grey",
  },
})

interface CalloutProps {
  emoji?: string
  color?: "grey" | "blue"
  children: ReactNode
}

export function Callout({ emoji, color, children }: CalloutProps) {
  return (
    <aside className={calloutVariants({ color })}>
      {emoji && (
        <span className="min-w-6 text-2xl leading-none" aria-hidden>
          {emoji}
        </span>
      )}
      <div className="flex-1 [&>:first-child]:mt-0 [&>:last-child]:mb-0">
        {children}
      </div>
    </aside>
  )
}
