"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { parseSelectedIdFromUrl } from "@/components/data-table/url-state.utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { CspBenchmarksChart } from "./csp-benchmarks-chart"
import { CspBenchmarksTableWithSuspense } from "./csp-benchmarks-table-with-suspense"

import {
  CspCollectedBenchmark,
  CspCollectedBenchmarks,
} from "@/lib/api/csp-benchmarks"

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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <span className="text-2xl">CSP benchmarks</span>
        <div className="w-full sm:w-auto">
          <Select
            value={selectedBenchmarkId}
            onValueChange={handleBenchmarkChange}
          >
            <SelectTrigger
              id="benchmark-select"
              className="w-full sm:w-[300px]"
            >
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
        <>
          <div className="mt-6">
            <CspBenchmarksChart benchmarks={benchmarksData} />
          </div>
          <CspBenchmarksTableWithSuspense
            className="mt-6"
            benchmarks={benchmarksData}
          />
        </>
      )}
    </>
  )
}
