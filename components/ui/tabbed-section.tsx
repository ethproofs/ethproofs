"use client"

import { type ReactNode } from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export interface TabbedSectionTab {
  value: string
  label: string
  count?: number
  isDisabled?: boolean
  disabledReason?: string
}

interface TabbedSectionProps {
  tabs: TabbedSectionTab[]
  activeTab: string
  onTabChange(value: string): void
  children: ReactNode
}

export function TabbedSection({
  tabs,
  activeTab,
  onTabChange,
  children,
}: TabbedSectionProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange}>
      <TabsList className="border-none">
        {tabs.map((tab) => {
          const label =
            tab.count !== undefined ? `${tab.label} (${tab.count})` : tab.label
          const isDisabled = tab.isDisabled ?? false

          const trigger = (
            <TabsTrigger
              key={tab.value}
              className="cursor-default border-none py-1 2xl:flex-1"
              value={tab.value}
              disabled={isDisabled}
            >
              {label}
            </TabsTrigger>
          )

          if (!isDisabled) return trigger

          return (
            <TooltipProvider key={tab.value} delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-center 2xl:flex-1">{trigger}</span>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-xs">
                    {tab.disabledReason ?? "no data available"}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )
        })}
      </TabsList>
      {children}
    </Tabs>
  )
}

export { TabsContent }
