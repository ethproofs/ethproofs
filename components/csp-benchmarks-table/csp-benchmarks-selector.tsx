"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { CspBenchmarksTable } from "./csp-benchmarks-table"

import {
  CspCollectedBenchmark,
  CspCollectedBenchmarks,
} from "@/lib/api/csp-benchmarks"

import { parseSelectedIdFromUrl } from "@/lib/url-state"

interface CspBenchmarksSelectorProps {
  benchmarks: CspCollectedBenchmarks[]
}

export function CspBenchmarksSelector({
  benchmarks,
}: CspBenchmarksSelectorProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultBenchmarkId = benchmarks[0]?.benchmarksId || ""
  const urlBenchmarkId = parseSelectedIdFromUrl(searchParams, "id")

  const [selectedBenchmarkId, setSelectedBenchmarkId] = useState<string>(
    urlBenchmarkId || defaultBenchmarkId
  )

  const handleBenchmarkChange = (newId: string) => {
    setSelectedBenchmarkId(newId)

    const params = new URLSearchParams(searchParams.toString())
    params.set("id", newId)

    router.push(`?${params.toString()}`)
  }

  const selectedBenchmarks = benchmarks.find(
    (benchmark) => benchmark.benchmarksId === selectedBenchmarkId
  )

  const benchmarksData: CspCollectedBenchmark[] = selectedBenchmarks
    ? selectedBenchmarks.data
    : []

  if (benchmarks.length === 0) {
    return (
      <div className="py-12 text-center text-body-secondary">
        no benchmark data available
      </div>
    )
  }

  return (
    <>
      <div className="flex items-end justify-between gap-4">
        <span className="text-2xl">CSP benchmarks</span>
        <div className="flex items-center gap-4">
          <Select
            value={selectedBenchmarkId}
            onValueChange={handleBenchmarkChange}
          >
            <SelectTrigger id="benchmark-select" className="w-[300px]">
              <SelectValue placeholder="Select a benchmark file" />
            </SelectTrigger>
            <SelectContent align="end">
              {benchmarks.map((b) => (
                <SelectItem key={b.benchmarksId} value={b.benchmarksId}>
                  {b.benchmarksId}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedBenchmarks && (
        <CspBenchmarksTable className="mt-4" benchmarks={benchmarksData} />
      )}
    </>
  )
}
