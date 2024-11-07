"use client"

import { useState } from "react"

import Magnifier from "@/components/svgs/magnifier.svg"
import { Input } from "@/components/ui/input"

import { cn } from "@/lib/utils"

import { useContainerQuery } from "@/hooks/useContainerQuery"
import useSearchKeyboardShortcuts from "@/hooks/useSearchKeyboardShortcuts"

const PLACEHOLDER = "Search by slot number / hash / number / prover block"
const k = 6.5

const SearchInput = ({ className }: React.HTMLAttributes<HTMLInputElement>) => {
  const [query, setQuery] = useState("")

  const { inputRef } = useSearchKeyboardShortcuts()

  const { isLarge, containerRef } = useContainerQuery(PLACEHOLDER.length * k)

  const placeholder = isLarge ? PLACEHOLDER : PLACEHOLDER.split(" ")[0]

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <Input
        ref={inputRef}
        type="search"
        tabIndex={1}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
      />
      <div
        className={cn(
          "pointer-events-none absolute inset-y-0 end-0 flex items-center pe-4 lg:m-0",
          !!query.length && "hidden"
        )}
      >
        <Magnifier className="text-primary" />
      </div>
    </div>
  )
}

export default SearchInput
