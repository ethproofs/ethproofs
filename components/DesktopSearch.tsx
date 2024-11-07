/* eslint-disable simple-import-sort/imports */

"use client"

import { useEffect, useRef, useState } from "react"
import { useMediaQuery } from "usehooks-ts"

import Magnifier from "@/components/svgs/magnifier.svg"
import { Input } from "@/components/ui/input"

import useSearchKeyboardShortcuts from "@/hooks/useSearchKeyboardShortcuts"
import { cn } from "@/lib/utils"

const DesktopSearch = () => {
  const [query, setQuery] = useState("")
  const ref = useRef<HTMLInputElement>(null)
  useSearchKeyboardShortcuts(ref)

  const [placeholder, setPlaceholder] = useState("")
  const isLarge = useMediaQuery("(min-width: 1024px)") // 64rem, lg breakpoint
  useEffect(() => {
    setPlaceholder(
      isLarge
        ? "Search by slot number / block hash / block number / prover"
        : "Search" // Tablet placeholder
    )
  }, [])

  return (
    <div className="relative w-full max-md:hidden">
      <Input
        ref={ref}
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

export default DesktopSearch
