"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEventListener } from "usehooks-ts"
import { isHash } from "viem"

import { Block } from "@/lib/types"

import Magnifier from "@/components/svgs/magnifier.svg"
import { Input } from "@/components/ui/input"

import { cn } from "@/lib/utils"

import { useContainerQuery } from "@/hooks/useContainerQuery"
import useSearchKeyboardShortcuts from "@/hooks/useSearchKeyboardShortcuts"
import { createClient } from "@/utils/supabase/client"

const PLACEHOLDER = "Search by block number or hash"
const k = 6.5
const supabase = createClient()

const SearchInput = ({ className }: React.HTMLAttributes<HTMLInputElement>) => {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [blockMatch, setBlockMatch] = useState<
    (Block & { proofs: { proof_status: string }[] }) | null
  >(null)

  useEventListener("keydown", (e) => {
    if (e.key !== "Enter" || !blockMatch) return
    const path = `/block/${blockMatch[isHash(query) ? "hash" : "block_number"]}`
    setQuery("")
    router.push(path)
  })

  useEffect(() => {
    setLoading(true)
    if (!query) {
      setBlockMatch(null)
      setLoading(false)
      return
    }
    const handler = setTimeout(async () => {
      const { data: match, error } = await supabase
        .from("blocks")
        .select(
          `*,
          proofs!inner(proof_status)
        `
        )
        .eq(isHash(query) ? "hash" : "block_number", query)
        .single()
      if (!error && match) {
        setBlockMatch(match)
        setLoading(false)
        return
      }

      setBlockMatch(null)
      setLoading(false)
    }, 250) // 250 ms debounce

    return () => {
      clearTimeout(handler)
    }
  }, [query])

  const { inputRef } = useSearchKeyboardShortcuts()

  const { isLarge, containerRef } = useContainerQuery(PLACEHOLDER.length * k)

  const placeholder = isLarge ? PLACEHOLDER : PLACEHOLDER.split(" ")[0]

  return (
    <div ref={containerRef} className={cn("relative z-0 w-full", className)}>
      <Input
        ref={inputRef}
        type="search"
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        value={query}
      />
      <div
        className={cn(
          "pointer-events-none absolute inset-y-0 end-0 flex items-center pe-4 lg:m-0",
          !!query.length && "hidden"
        )}
      >
        <Magnifier className="text-primary" />
      </div>
      {!!query.length && (
        <div className="absolute inset-x-0 top-0 -z-10 flex h-fit flex-col rounded-b-2xl rounded-t-3xl border border-primary bg-background bg-gradient-to-b from-white/[0.06] to-white/[0.12] px-2 pb-2 pt-[3.5rem] lg:m-0">
          {blockMatch ? (
            <Link
              href={`/block/${blockMatch[isHash(query) ? "hash" : "block_number"]}`}
              className="rounded-lg border border-primary-light bg-background-active p-2"
              onClick={() => setQuery("")}
            >
              <div className="flex justify-between">
                <span className="block text-sm text-primary">
                  <span className="font-body">Block: </span>
                  {blockMatch.block_number}
                </span>
                <span className="block text-sm text-primary">
                  <span className="font-body">Proofs:</span>{" "}
                  {
                    blockMatch.proofs.filter((p) => p.proof_status === "proved")
                      .length
                  }
                  <span className="text-xs text-body-secondary">
                    /{blockMatch.proofs.length}
                  </span>
                </span>
              </div>
              <span className="block text-sm text-primary">
                <span className="font-body">Hash: </span>
                <span className="block truncate">{blockMatch.hash}</span>
              </span>
            </Link>
          ) : (
            <div className="rounded-lg border border-primary-light bg-background-active p-2">
              {loading ? "Loading" : "No results"}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SearchInput
