"use client"

import { useState } from "react"
import { Info } from "lucide-react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { CspBenchmarksBar } from "./csp-benchmarks-bar"
import { CspBenchmarksLine } from "./csp-benchmarks-line"
import { CspBenchmarksRadar } from "./csp-benchmarks-radar"
import { CspBenchmarksTable } from "./csp-benchmarks-table"

import { BenchmarkCollection } from "@/lib/api/csp-benchmarks"

interface CspBenchmarksSelectorProps {
  benchmarks: BenchmarkCollection[]
}

export function CspBenchmarksSelector({
  benchmarks,
}: CspBenchmarksSelectorProps) {
  const benchmarksData = benchmarks[0]?.data || []

  if (benchmarks.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        no benchmark data available
      </div>
    )
  }

  return (
    <>
      <h1 className="relative z-10 mb-24 mt-16 px-0 text-center text-3xl font-semibold md:mt-20 md:px-8">
        <div className="flex flex-col items-center justify-center gap-0 sm:flex-row">
          <span>local proving enables </span>
          <span className="px-2 text-primary">privacy</span>
          <span> on </span>
          <div className="flex items-center">
            <span className="pl-2 font-heading text-primary sm:pl-2">Eth</span>
            <span className="inline pr-2 font-heading text-primary">ereum</span>
          </div>
        </div>
      </h1>

      <div className="mx-auto mb-16 flex max-w-screen-xl flex-col items-center px-6 [&>section]:w-full">
        <Tabs defaultValue="sha-256" className="w-full">
          <section id="circuits">
            <div className="flex flex-col items-start justify-between gap-4 pb-4 sm:flex-row sm:items-end sm:gap-2">
              <span className="text-2xl">circuits</span>
              <TabsList className="h-8 w-full px-0.5 sm:w-auto">
                <TabsTrigger
                  value="sha-256"
                  className="flex-1 px-2 py-1 text-xs data-[state=active]:text-primary sm:px-3 sm:text-sm"
                >
                  sha-256
                </TabsTrigger>
                <TabsTrigger
                  value="ecdsa"
                  className="flex-1 px-2 py-1 text-xs data-[state=active]:text-primary sm:px-3 sm:text-sm"
                >
                  ecdsa
                </TabsTrigger>
              </TabsList>
            </div>
          </section>

          <div className="w-full">
            <TabsContent value="sha-256" className="mt-0 w-full space-y-12">
              <section id="comparison" className="w-full space-y-6">
                <CspBenchmarksBar benchmarks={benchmarksData} target="sha256" />
              </section>

              <section id="trends" className="w-full space-y-6">
                <div className="flex items-center justify-start gap-2">
                  <span className="text-2xl">trends</span>
                </div>
                <CspBenchmarksLine
                  benchmarks={benchmarksData}
                  target="sha256"
                />
              </section>
            </TabsContent>

            <TabsContent value="ecdsa" className="mt-0 w-full">
              <section id="comparison" className="w-full space-y-6">
                <CspBenchmarksBar benchmarks={benchmarksData} target="ecdsa" />
              </section>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      <div className="mx-auto mb-16 flex max-w-screen-xl flex-col items-center px-6 [&>section]:w-full">
        <section id="aggregated-results" className="w-full space-y-6">
          <div className="space-y-2">
            <TooltipProvider delayDuration={0}>
              <div className="flex items-center justify-start gap-2">
                <span className="text-2xl">aggregated results</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="text-muted-foreground transition-colors hover:text-foreground"
                      aria-label="Info about aggregation algorithm"
                    >
                      <Info className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[300px] p-4">
                    <p className="text-sm">
                      Each prover&apos;s score is calculated using the{" "}
                      <strong>median</strong> of all benchmarks across both
                      SHA-256 and ECDSA circuits at all input sizes. This
                      approach ensures no single circuit or input size dominates
                      the results, providing a fair comparison.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
            <p className="text-sm text-muted-foreground">bigger is better</p>
          </div>
          <CspBenchmarksRadar benchmarks={benchmarksData} />
        </section>
      </div>

      <div className="mx-auto mb-16 flex max-w-screen-xl flex-col items-center px-6 [&>section]:w-full">
        <section id="all-results" className="w-full space-y-6">
          <div className="flex items-center justify-start gap-2">
            <span className="text-2xl">all results</span>
          </div>
          <CspBenchmarksTable benchmarks={benchmarksData} />
        </section>
      </div>
    </>
  )
}
