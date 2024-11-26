"use client"

import { useEffect, useState } from "react"

import Magnifier from "@/components/svgs/magnifier.svg"
import { Input } from "@/components/ui/input"

import { cn } from "@/lib/utils"

import { useContainerQuery } from "@/hooks/useContainerQuery"
import useSearchKeyboardShortcuts from "@/hooks/useSearchKeyboardShortcuts"
import { createClient } from "@/utils/supabase/client"
import { Block } from "@/lib/types"

const PLACEHOLDER = "Search by block number or hash"
const k = 6.5
const supabase = createClient()

const SearchInput = ({ className }: React.HTMLAttributes<HTMLInputElement>) => {
  const [query, setQuery] = useState("")
  const [blockMatch, setBlockMatch] = useState<Block | null>(null)

  useEffect(() => {
    if (!query) {
      setBlockMatch(null)
      return
    }
    const handler = setTimeout(async () => {
      const hashRegExp = /^0x[0-9a-fA-F]{64}$/

      const { data: match, error } = await supabase
        .from("blocks")
        .select("*")
        .eq(hashRegExp.test(query) ? "hash" : "block_number", query)
        .single()
      if (!error && match) {
        setBlockMatch(match)
        return
      }

      setBlockMatch(null)
    }, 250) // 250 ms debounce

    return () => {
      clearTimeout(handler)
    }
  }, [query])

  const { inputRef } = useSearchKeyboardShortcuts()

  const { isLarge, containerRef } = useContainerQuery(PLACEHOLDER.length * k)

  const placeholder = isLarge ? PLACEHOLDER : PLACEHOLDER.split(" ")[0]

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <Input
        ref={inputRef}
        type="search"
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
      {blockMatch && (
        <div className="absolute inset-x-0 top-0 -z-10 flex h-fit flex-col rounded-b-2xl rounded-t-3xl border border-body-secondary bg-background bg-gradient-to-b from-white/[0.06] to-white/[0.12] ps-4 pt-12 lg:m-0">
          <span className="block text-sm text-primary">
            Block: {blockMatch.block_number}
          </span>
          <span className="block text-sm text-primary">
            Hash: <span className="block truncate">{blockMatch.hash}</span>
          </span>
        </div>
      )}
    </div>
  )
}

export default SearchInput
