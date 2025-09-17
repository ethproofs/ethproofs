"use client"

import { useRef, useState } from "react"
import { Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { useDebounceValue, useEventListener } from "usehooks-ts"
import { isHash } from "viem"
import { useQuery } from "@tanstack/react-query"

import type { BlockBase } from "@/lib/types"

import { Input } from "@/components/ui/input"

import { cn } from "@/lib/utils"

import { DrawerClose } from "../ui/drawer"
import Link, { LinkProps } from "../ui/link"

import useSearchKeyboardShortcuts from "@/hooks/useSearchKeyboardShortcuts"

const DEBOUNCE = 250 // ms delay before querying database
const PLACEHOLDER = "search by block number or hash"

const SearchInput = ({
  className,
  onSubmit,
  placeholder = PLACEHOLDER,
  insideDrawer,
}: React.HTMLAttributes<HTMLInputElement> & {
  onSubmit?: () => void
  placeholder?: string
  insideDrawer?: boolean
}) => {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [deferredQuery] = useDebounceValue(query, DEBOUNCE)
  const searchContainerRef = useRef<HTMLDivElement>(null)

  const { data: blockMatch, isLoading } = useQuery<
    (BlockBase & { proofs: { proof_status: string }[] }) | null
  >({
    queryKey: ["blocks", deferredQuery],
    queryFn: async () => {
      const response = await fetch(`/api/blocks/search?query=${deferredQuery}`)
      return response.json()
    },
    enabled: !!deferredQuery && deferredQuery.length > 2,
    staleTime: 30 * 1000, // Cache for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  })

  const handleSubmit = () => {
    setQuery("")
    if (!onSubmit) return
    onSubmit()
  }

  // Clear query when clicking outside
  useEventListener("mousedown", (e) => {
    if (!query || searchContainerRef?.current?.contains(e.target as Node)) return
    setQuery("")
  })

  useEventListener("keydown", (e) => {
    if (e.key !== "Enter" || !blockMatch || !query) return
    const path = `/blocks/${blockMatch[isHash(query) ? "hash" : "block_number"]}`
    handleSubmit()
    router.push(path)
  })

  const { inputRef } = useSearchKeyboardShortcuts()

  const ResultLink = ({ href, ...props }: LinkProps) =>
    insideDrawer ? (
      <DrawerClose asChild>
        <Link href={href} {...props} />
      </DrawerClose>
    ) : (
      <Link href={href} {...props} />
    )

  return (
    <div ref={searchContainerRef} className={cn("relative w-full", className)}>
      <div
      // className={cn(
      //   "z-50",
      //   "relative rounded-full border border-primary",
      //   "before:absolute before:inset-0 before:-z-[2] before:rounded-full before:bg-gradient-to-tl before:from-primary before:to-primary/10",
      //   "after:absolute after:inset-px after:-z-[1] after:rounded-[calc(100vmax_-_1px)] after:bg-background",
      //   "[&>input:focus-visible]:after:bg-gradient-to-tl [&>input:focus-visible]:after:to-background-active"
      // )}
      >
        <Input
          ref={inputRef}
          type="search"
          onChange={(e) => setQuery(e.target.value)}
          aria-label={placeholder}
          placeholder={placeholder}
          value={query}
          className={cn("min-w-[300px]")}
        />
      </div>
      {!!query.length && (
        <div className="absolute inset-x-0 top-1/2 z-10 flex h-fit flex-col rounded-b-2xl rounded-t-none border border-primary-light bg-background px-2 pb-2 pt-8 dark:border-primary-border lg:m-0">
          {blockMatch ? (
            <ResultLink
              href={`/blocks/${blockMatch[isHash(query) ? "hash" : "block_number"]}`}
              className="rounded-lg border border-primary-light bg-background-active p-2"
              onClick={handleSubmit}
            >
              <div className="flex justify-between">
                <span className="block text-sm text-primary">
                  <span className="font-body">block: </span>
                  {blockMatch.block_number}
                </span>
                <span className="block text-sm text-primary">
                  <span className="font-body">proofs:</span>{" "}
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
                <span className="font-body">hash: </span>
                <span className="block truncate">{blockMatch.hash}</span>
              </span>
            </ResultLink>
          ) : (
            <div className="rounded-lg border border-primary-light bg-background-active p-2">
              {isLoading ? "loading" : "no results"}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SearchInput
