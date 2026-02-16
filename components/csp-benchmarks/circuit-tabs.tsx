"use client"

import {
  startTransition,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import {
  type CircuitTarget,
  circuitTargets,
  defaultCircuitTarget,
  inputSizeSearchParam,
  isValidCircuitTarget,
  targetSearchParam,
} from "./circuits"

interface CircuitTabsProps {
  renderTabContent(target: CircuitTarget): React.ReactNode
}

export function CircuitTabs({ renderTabContent }: CircuitTabsProps) {
  const [activeTarget, setActiveTarget] =
    useState<CircuitTarget>(defaultCircuitTarget)

  useLayoutEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const param = params.get(targetSearchParam)
    if (isValidCircuitTarget(param)) {
      setActiveTarget(param)
    }
  }, [])

  const mountedTabs = useRef(new Set<CircuitTarget>())
  mountedTabs.current.add(activeTarget)

  const handleTargetChange = useCallback((value: string) => {
    if (!isValidCircuitTarget(value)) return
    const params = new URLSearchParams(window.location.search)
    params.set(targetSearchParam, value)
    params.delete(inputSizeSearchParam)
    window.history.replaceState(null, "", `?${params.toString()}`)
    startTransition(() => {
      setActiveTarget(value)
    })
  }, [])

  return (
    <Tabs value={activeTarget} onValueChange={handleTargetChange}>
      <div className="relative flex items-center justify-center gap-4 px-4 sm:justify-between sm:px-6">
        <span className="hidden shrink-0 text-sm font-medium sm:block">
          circuit
        </span>
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
        <TabsContent
          key={target}
          value={target}
          forceMount
          className="data-[state=inactive]:hidden"
        >
          {mountedTabs.current.has(target) && renderTabContent(target)}
        </TabsContent>
      ))}
    </Tabs>
  )
}
