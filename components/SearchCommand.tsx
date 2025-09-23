"use client"

import * as React from "react"
import { useState } from "react"
import { LoaderCircle, Search, X as Clear } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { truncateHash } from "@/lib/utils"

export type SearchItem = {
  id: string | number
  href: string
  blockHash: string
  blockNumber: number
  provedProofs: number
  totalProofs: number
}

export function SearchCommand({
  query,
  placeholder,
  onSearch,
  onSelect,
  emptyLabel = "no results found",
  buttonClassName,
  isLoading,
  items,
}: {
  query: string
  onSearch: (value: string) => void
  onSelect?: (item: SearchItem) => void
  placeholder?: string
  emptyLabel?: string
  buttonClassName?: string
  isLoading: boolean
  items: SearchItem[]
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button size="icon" variant="ghost" className={buttonClassName}>
          <Search />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="h-[125px] w-[min(28rem,90vw)] p-0 sm:w-[min(32rem,90vw)]"
        align="start"
        alignOffset={-60}
        sideOffset={10}
      >
        <Command shouldFilter={false}>
          <div className="flex items-center gap-2 px-2">
            <CommandInput
              value={query}
              autoFocus
              onValueChange={onSearch}
              placeholder={placeholder}
            />
            {query && (
              <Button
                variant="ghost"
                size="icon"
                className="ml-auto"
                onClick={() => onSearch("")}
                aria-label="clear query"
              >
                <Clear />
              </Button>
            )}
          </div>
          <CommandList className="mt-2 max-h-72 overflow-y-hidden">
            {isLoading ? (
              <div className="text-muted-foreground flex items-center gap-2 px-3 py-2 text-sm">
                <LoaderCircle className="size-4 animate-spin" /> searching…
              </div>
            ) : (
              <>
                <CommandEmpty>{emptyLabel}</CommandEmpty>
                <CommandGroup>
                  {(items || []).map((item) => (
                    <CommandItem
                      key={item.id}
                      value={String(item.id)}
                      onSelect={() => {
                        setOpen(false)
                        onSearch("")
                        if (item.href) {
                          router.push(item.href)
                        }
                        onSelect?.(item)
                      }}
                      className="flex flex-col items-start gap-1 overflow-hidden"
                    >
                      <div className="w-full truncate text-sm font-medium leading-none">
                        block {item.blockNumber}
                      </div>
                      <div className="text-muted-foreground w-full text-xs leading-tight">
                        <div className="block truncate sm:hidden">
                          {item.provedProofs} / {item.totalProofs} •{" "}
                          {truncateHash(item.blockHash)}
                        </div>
                        <div className="hidden sm:block md:line-clamp-2">
                          {item.provedProofs} / {item.totalProofs} •{" "}
                          {item.blockHash}
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
