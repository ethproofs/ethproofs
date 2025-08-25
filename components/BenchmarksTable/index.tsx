"use client"

import prettyMs from "pretty-ms"

import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { BenchmarkResult } from "@/lib/api/benchmarks"
// import { getBenchmarkColor } from "@/lib/benchmarks"

interface BenchmarksTableProps {
  data: BenchmarkResult[]
}

function parseTestName(name: string) {
  const parts = name.split("::")
  const testFile =
    parts[0]?.replace("test_", "").replace(".py", "") || "Unknown"
  const testFunction =
    parts[1]?.split("[")[0]?.replace("test_", "") || "Unknown"
  const parameters = parts[1]?.match(/\[([^\]]+)\]/)?.[1] || ""

  return {
    testFile,
    testFunction,
    parameters,
  }
}

function formatGasPerSecond(gasPerSecond: number): string {
  if (gasPerSecond >= 1_000_000) {
    return `${(gasPerSecond / 1_000_000).toFixed(1)}M gas/s`
  } else if (gasPerSecond >= 1_000) {
    return `${(gasPerSecond / 1_000).toFixed(1)}K gas/s`
  } else {
    return `${gasPerSecond.toFixed(0)} gas/s`
  }
}

export function BenchmarksTable({ data }: BenchmarksTableProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-body-secondary">
        no benchmark data available
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col gap-8">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="px-6 text-left">test case</TableHead>
            <TableHead>gas throughput</TableHead>
            <TableHead>proving time</TableHead>
            <TableHead>status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((benchmark, index) => {
            const { testFunction, parameters } = parseTestName(benchmark.name)
            const isSuccess = !!benchmark.proving.success
            const provingTimeMs = benchmark.proving.success?.proving_time_ms
            // const severityColor = getBenchmarkColor(provingTimeMs)

            return (
              <TableRow key={index}>
                <TableCell className="px-6 text-left">
                  <div className="space-y-1">
                    <div className="font-medium">{testFunction}</div>
                    <div className="text-sm text-body-secondary">
                      {parameters && <span>[{parameters}]</span>}
                    </div>
                    {!isSuccess && (
                      <div className="text-sm text-body-secondary">
                        reason: {benchmark.proving.crashed?.reason}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="px-6">
                  {provingTimeMs && benchmark.metadata?.block_used_gas ? (
                    formatGasPerSecond(
                      (benchmark.metadata.block_used_gas / provingTimeMs) * 1000
                    )
                  ) : (
                    <span className="text-body-secondary">-</span>
                  )}
                </TableCell>
                <TableCell className="px-6">
                  {isSuccess && benchmark.proving.success ? (
                    <span>
                      {prettyMs(benchmark.proving.success.proving_time_ms)}
                    </span>
                  ) : (
                    <span className="text-body-secondary">-</span>
                  )}
                </TableCell>
                <TableCell className="px-6">
                  <Badge variant={isSuccess ? "default" : "destructive"}>
                    {isSuccess ? "Success" : "Crashed"}
                  </Badge>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
