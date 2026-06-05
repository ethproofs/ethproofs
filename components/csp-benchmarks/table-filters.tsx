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

const securityFilterAllValue = "all"
const securityFilterMinimum100Value = "100+"
const securityFilterMinimum128Value = "128+"
const securityFilterKey = "security"
const minimum100SecurityBits = 100
const minimum128SecurityBits = 128

type BooleanFilterValue = boolean | null
type SecurityFilterValue =
  | typeof securityFilterAllValue
  | typeof securityFilterMinimum100Value
  | typeof securityFilterMinimum128Value

type BooleanFilterKey =
  | "is_zkvm"
  | "is_zk"
  | "is_pq"
  | "is_audited"
  | "is_maintained"

type SecurityFilterKey = typeof securityFilterKey
type FilterKey = BooleanFilterKey | SecurityFilterKey
type FilterValue = BooleanFilterValue | SecurityFilterValue
type FilterState = Record<BooleanFilterKey, BooleanFilterValue> &
  Record<SecurityFilterKey, SecurityFilterValue>

const booleanFilterDefinitions: ReadonlyArray<{
  key: BooleanFilterKey
  label: string
}> = [
  { key: "is_zk", label: "zero-knowledge" },
  { key: "is_pq", label: "post-quantum" },
  { key: "is_zkvm", label: "VM" },
  { key: "is_audited", label: "audited" },
  { key: "is_maintained", label: "maintained" },
]

const initialFilterState: FilterState = {
  is_zkvm: null,
  is_zk: null,
  is_pq: null,
  is_audited: null,
  is_maintained: null,
  security: securityFilterAllValue,
}

const auditedStatus = "audited"

function matchesFilter(
  row: Metrics,
  key: BooleanFilterKey,
  value: boolean
): boolean {
  if (key === "is_audited") {
    return value
      ? row.is_audited === auditedStatus
      : row.is_audited !== undefined && row.is_audited !== auditedStatus
  }
  const field = row[key]
  return value ? field === true : field === false
}

function getSecurityThreshold(value: SecurityFilterValue): number | null {
  if (value === securityFilterMinimum100Value) return minimum100SecurityBits
  if (value === securityFilterMinimum128Value) return minimum128SecurityBits
  return null
}

function matchesSecurityFilter(
  row: Metrics,
  value: SecurityFilterValue
): boolean {
  const threshold = getSecurityThreshold(value)
  if (threshold === null) return true
  return typeof row.security_bits === "number" && row.security_bits >= threshold
}

function updateFilterState(
  filters: FilterState,
  key: FilterKey,
  value: FilterValue
): FilterState {
  if (key === securityFilterKey) {
    if (typeof value !== "string") return filters
    return { ...filters, security: value }
  }

  if (typeof value === "string") return filters
  return { ...filters, [key]: value }
}

function getActiveFilterCount(filters: FilterState): number {
  let count = filters.security === securityFilterAllValue ? 0 : 1

  for (const { key } of booleanFilterDefinitions) {
    if (filters[key] !== null) {
      count += 1
    }
  }

  return count
}

interface UseTableFiltersReturn {
  filters: FilterState
  setFilter(key: FilterKey, value: FilterValue): void
  activeCount: number
  applyFilters(benchmarks: Metrics[]): Metrics[]
}

export function useTableFilters(): UseTableFiltersReturn {
  const [filters, setFilters] = useState<FilterState>(initialFilterState)

  const setFilter = useCallback((key: FilterKey, value: FilterValue) => {
    setFilters((prev) => updateFilterState(prev, key, value))
  }, [])

  const activeCount = useMemo(() => getActiveFilterCount(filters), [filters])

  const applyFilters = useCallback(
    (benchmarks: Metrics[]) =>
      benchmarks.filter(
        (row) =>
          booleanFilterDefinitions.every(({ key }) => {
            const value = filters[key]
            if (value === null) return true
            return matchesFilter(row, key, value)
          }) && matchesSecurityFilter(row, filters.security)
      ),
    [filters]
  )

  return { filters, setFilter, activeCount, applyFilters }
}

const segmentOptions: ReadonlyArray<{
  label: string
  value: BooleanFilterValue
}> = [
  { label: "all", value: null },
  { label: "yes", value: true },
  { label: "no", value: false },
]

const securitySegmentOptions: ReadonlyArray<{
  label: SecurityFilterValue
  value: SecurityFilterValue
}> = [
  { label: securityFilterAllValue, value: securityFilterAllValue },
  {
    label: securityFilterMinimum100Value,
    value: securityFilterMinimum100Value,
  },
  {
    label: securityFilterMinimum128Value,
    value: securityFilterMinimum128Value,
  },
]

const segmentGroupClass = "grid w-28 grid-cols-3 rounded-md border"
const segmentButtonClass =
  "px-0 py-0.5 text-center text-xs transition-colors first:rounded-l-[calc(theme(borderRadius.md)-1px)] last:rounded-r-[calc(theme(borderRadius.md)-1px)]"

interface TableFiltersProps {
  filters: FilterState
  setFilter(key: FilterKey, value: FilterValue): void
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
        <Button
          variant="outline"
          size="sm"
          className="h-8"
          aria-label="filter properties"
        >
          <ListFilter />
          properties
          {activeCount > 0 && (
            <Badge className="size-5 justify-center rounded-full px-0 text-[10px]">
              {activeCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-3">
        <div className="flex flex-col gap-2">
          {booleanFilterDefinitions.slice(0, 2).map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm">{label}</span>
              <div
                className={segmentGroupClass}
                role="group"
                aria-label={`${label} filter`}
              >
                {segmentOptions.map((option) => (
                  <button
                    key={String(option.value)}
                    type="button"
                    aria-pressed={filters[key] === option.value}
                    className={cn(
                      segmentButtonClass,
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
          <div className="flex items-center justify-between">
            <span className="text-sm">security</span>
            <div
              className={segmentGroupClass}
              role="group"
              aria-label="security filter"
            >
              {securitySegmentOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={filters.security === option.value}
                  className={cn(
                    segmentButtonClass,
                    filters.security === option.value
                      ? "bg-accent text-accent-foreground"
                      : "bg-transparent hover:bg-accent/50"
                  )}
                  onClick={() => setFilter(securityFilterKey, option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          {booleanFilterDefinitions.slice(2).map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm">{label}</span>
              <div
                className={segmentGroupClass}
                role="group"
                aria-label={`${label} filter`}
              >
                {segmentOptions.map((option) => (
                  <button
                    key={String(option.value)}
                    type="button"
                    aria-pressed={filters[key] === option.value}
                    className={cn(
                      segmentButtonClass,
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
