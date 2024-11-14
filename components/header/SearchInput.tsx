"use client"

import { useEffect, useState } from "react"

import Magnifier from "@/components/svgs/magnifier.svg"
import { Input } from "@/components/ui/input"

import { cn } from "@/lib/utils"

import { useContainerQuery } from "@/hooks/useContainerQuery"
import useSearchKeyboardShortcuts from "@/hooks/useSearchKeyboardShortcuts"
import { createClient } from "@/utils/supabase/client"

const PLACEHOLDER = "Search by slot number / hash / number / prover block"
const k = 6.5
const supabase = createClient()

const SearchInput = ({ className }: React.HTMLAttributes<HTMLInputElement>) => {
  const [query, setQuery] = useState("")
  const [match, setMatch] = useState<string | null>(null)

  useEffect(() => {
    const handler = setTimeout(async () => {
      if (!query) {
        setMatch(null)
        return
      }

      const { data: blockMatch } = await supabase
        .from("blocks")
        .select("*,block_number::text")
        .eq("block_number", query)
        .single()
      if (blockMatch?.block_number) {
        setMatch(blockMatch?.block_number)
        return
      }

      const { data: hashMatch } = await supabase
        .from("blocks")
        .select("*,hash::text")
        .eq("hash", query)
        .single()
      if (hashMatch?.hash) {
        setMatch(hashMatch?.hash)
        return
      }

      setMatch("No results found")
    }, 750) // 750 ms debounce

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
      {match && (
        <div className="absolute inset-y-0 start-0 top-[150%] flex items-center ps-4 lg:m-0">
          <span className="text-sm text-primary">{match}</span>
        </div>
      )}
    </div>
  )
}

export default SearchInput
