"use client"

import { useState } from "react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { CspBenchmarksTable } from "./csp-benchmarks-table"
import { CspBenchmarkRow } from "./columns"

export type BenchmarkFile = {
  benchmarkId: string
  filename: string
  updatedAt?: string | null
  data: any[]
}

interface CspBenchmarksSelectorProps {
  benchmarkFiles: BenchmarkFile[]
}

export function CspBenchmarksSelector({
  benchmarkFiles,
}: CspBenchmarksSelectorProps) {
  const [selectedBenchmarkId, setSelectedBenchmarkId] = useState<string>(
    benchmarkFiles[0]?.benchmarkId || ""
  )

  const selectedFile = benchmarkFiles.find(
    (file) => file.benchmarkId === selectedBenchmarkId
  )

  // Convert the selected file's data into table rows
  const benchmarkRows: CspBenchmarkRow[] = selectedFile
    ? Array.isArray(selectedFile.data)
      ? (selectedFile.data.map((item) => ({
          benchmarkId: selectedFile.benchmarkId,
          ...item,
        })) as CspBenchmarkRow[])
      : []
    : []

  if (benchmarkFiles.length === 0) {
    return (
      <div className="py-12 text-center text-body-secondary">
        no benchmark data available
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <span className="text-2xl">CSP benchmarks</span>
        <div className="flex items-center gap-4">
          <label htmlFor="benchmark-select" className="text-sm font-medium">
            select benchmark:
          </label>
          <Select
            value={selectedBenchmarkId}
            onValueChange={setSelectedBenchmarkId}
          >
            <SelectTrigger id="benchmark-select" className="w-[300px]">
              <SelectValue placeholder="Select a benchmark file" />
            </SelectTrigger>
            <SelectContent align="end">
              {benchmarkFiles.map((file) => (
                <SelectItem key={file.benchmarkId} value={file.benchmarkId}>
                  {file.benchmarkId}
                  {file.data && ` (${file.data.length} benchmarks)`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedFile && (
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">
            showing {benchmarkRows.length} benchmark
            {benchmarkRows.length !== 1 ? "s" : ""} from{" "}
            <span className="font-medium">{selectedFile.filename}</span>
          </div>
          <CspBenchmarksTable benchmarks={benchmarkRows} />
        </div>
      )}
    </div>
  )
}
