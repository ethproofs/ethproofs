"use client"

import { useRouter, useSearchParams } from "next/navigation"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import {
  type CircuitTarget,
  inputSizeSearchParam,
  targetSearchParam,
  circuitTargets,
  defaultCircuitTarget,
  isValidCircuitTarget,
} from "./circuits"

interface CircuitTabsProps {
  renderTabContent(target: CircuitTarget): React.ReactNode
}

export function CircuitTabs({
  renderTabContent,
}: CircuitTabsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const targetParam = searchParams.get(targetSearchParam)
  const activeTarget: CircuitTarget = isValidCircuitTarget(targetParam)
    ? targetParam
    : defaultCircuitTarget

  const handleTargetChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set(targetSearchParam, value)
    params.delete(inputSizeSearchParam)
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  return (
    <Tabs value={activeTarget} onValueChange={handleTargetChange}>
      <div className="relative flex items-center justify-center gap-4 px-4 sm:justify-between sm:px-6">
        <span className="hidden shrink-0 text-sm font-medium sm:block">circuit</span>
        <div className="overflow-x-auto">
          <TabsList className="h-auto p-0.5">
            {circuitTargets.map((target) => (
              <TabsTrigger
                key={target}
                className="px-3 py-1.5 text-sm data-[state=active]:text-primary"
                value={target}
              >
                {target}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </div>
      {circuitTargets.map((target) => (
        <TabsContent key={target} value={target}>
          {renderTabContent(target)}
        </TabsContent>
      ))}
    </Tabs>
  )
}
