"use client"

import { useCallback, useMemo, useState } from "react"
import { ListFilter } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { cn } from "@/lib/utils"

import type { Metrics } from "@/lib/api/csp-benchmarks"

type FilterValue = boolean | null

type BooleanFilterKey =
  | "is_zkvm"
  | "is_zk"
  | "is_pq"
  | "is_audited"
  | "is_maintained"

type FilterState = Record<BooleanFilterKey, FilterValue>

const filterDefinitions: ReadonlyArray<{
  key: BooleanFilterKey
  label: string
}> = [
  { key: "is_zkvm", label: "VM" },
  { key: "is_zk", label: "zero-knowledge" },
  { key: "is_pq", label: "post-quantum" },
  { key: "is_audited", label: "audited" },
  { key: "is_maintained", label: "maintained" },
]

const initialFilterState: FilterState = {
  is_zkvm: null,
  is_zk: null,
  is_pq: null,
  is_audited: null,
  is_maintained: null,
}

const auditedStatus = "audited"

function matchesFilter(row: Metrics, key: BooleanFilterKey, value: boolean): boolean {
  if (key === "is_audited") {
    return value ? row.is_audited === auditedStatus : row.is_audited !== undefined && row.is_audited !== auditedStatus
  }
  const field = row[key]
  return value ? field === true : field === false
}

interface UseTableFiltersReturn {
  filters: FilterState
  setFilter(key: BooleanFilterKey, value: FilterValue): void
  activeCount: number
  applyFilters(benchmarks: Metrics[]): Metrics[]
}

export function useTableFilters(): UseTableFiltersReturn {
  const [filters, setFilters] = useState<FilterState>(initialFilterState)

  const setFilter = useCallback(
    (key: BooleanFilterKey, value: FilterValue) => {
      setFilters((prev) => ({ ...prev, [key]: value }))
    },
    []
  )

  const activeCount = useMemo(
    () => Object.values(filters).filter((v) => v !== null).length,
    [filters]
  )

  const applyFilters = useCallback(
    (benchmarks: Metrics[]) =>
      benchmarks.filter((row) =>
        filterDefinitions.every(({ key }) => {
          const value = filters[key]
          if (value === null) return true
          return matchesFilter(row, key, value)
        })
      ),
    [filters]
  )

  return { filters, setFilter, activeCount, applyFilters }
}

const segmentOptions: ReadonlyArray<{ label: string; value: FilterValue }> = [
  { label: "all", value: null },
  { label: "yes", value: true },
  { label: "no", value: false },
]

interface TableFiltersProps {
  filters: FilterState
  setFilter(key: BooleanFilterKey, value: FilterValue): void
  activeCount: number
}

export function TableFilters({
  filters,
  setFilter,
  activeCount,
}: TableFiltersProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8" aria-label="filter properties">
          <ListFilter />
          <span className="hidden md:block">properties</span>
          {activeCount > 0 && (
            <Badge className="size-5 justify-center rounded-full px-0 text-[10px]">
              {activeCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-3">
        <div className="flex flex-col gap-2">
          {filterDefinitions.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm">{label}</span>
              <div className="flex rounded-md border" role="group" aria-label={`${label} filter`}>
                {segmentOptions.map((option) => (
                  <button
                    key={String(option.value)}
                    type="button"
                    aria-pressed={filters[key] === option.value}
                    className={cn(
                      "px-2 py-0.5 text-xs transition-colors",
                      "first:rounded-l-[calc(theme(borderRadius.md)-1px)] last:rounded-r-[calc(theme(borderRadius.md)-1px)]",
                      filters[key] === option.value
                        ? "bg-accent text-accent-foreground"
                        : "bg-transparent hover:bg-accent/50"
                    )}
                    onClick={() => setFilter(key, option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
