"use client"

import { useCallback, useMemo, useRef, useState } from "react"
import { Info } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ChartConfig } from "@/components/ui/chart"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Toggle } from "@/components/ui/toggle"

import { cn } from "@/lib/utils"

const hoverOpenDelay = 200
const hoverCloseDelay = 300

interface InfoPopoverProps {
  trigger: React.ReactNode
  children: React.ReactNode
}

export function InfoPopover({ trigger, children }: InfoPopoverProps) {
  const [open, setOpen] = useState(false)
  const openTimeout = useRef<ReturnType<typeof setTimeout>>(null)
  const closeTimeout = useRef<ReturnType<typeof setTimeout>>(null)

  const clearTimers = useCallback(() => {
    if (openTimeout.current) clearTimeout(openTimeout.current)
    if (closeTimeout.current) clearTimeout(closeTimeout.current)
  }, [])

  const handleMouseEnter = useCallback(() => {
    clearTimers()
    openTimeout.current = setTimeout(() => setOpen(true), hoverOpenDelay)
  }, [clearTimers])

  const handleMouseLeave = useCallback(() => {
    clearTimers()
    closeTimeout.current = setTimeout(() => setOpen(false), hoverCloseDelay)
  }, [clearTimers])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <PopoverTrigger className="flex items-center gap-2 hover:opacity-80">
          {trigger}
          <Info className="size-4 shrink-0 text-muted-foreground" />
        </PopoverTrigger>
      </div>
      <PopoverContent
        className="w-fit max-w-80 text-sm sm:max-w-96"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </PopoverContent>
    </Popover>
  )
}

interface ChartCardProps {
  title: string | React.ReactNode
  description?: string
  children: React.ReactNode
  height?: string | number
  label?: string
  ariaLabel?: string
  footer?: React.ReactNode
}

export function ChartCard({ title, description, children, height, label, ariaLabel, footer }: ChartCardProps) {
  const style = height
    ? {
        height: typeof height === "number" ? `${height}px` : height,
        transition: typeof height === "number" ? "height 200ms ease-out" : undefined,
      }
    : undefined

  return (
    <Card className="w-full space-y-4" aria-label={ariaLabel}>
      <CardHeader>
        <div className="flex items-center justify-center">
          {description ? (
            <InfoPopover trigger={<CardTitle className="text-base font-medium sm:text-lg">{title}</CardTitle>}>
              <p>{description}</p>
            </InfoPopover>
          ) : (
            <CardTitle className="text-center text-base font-medium sm:text-lg">{title}</CardTitle>
          )}
          {label && (
            <span className="ml-auto font-mono text-xs text-muted-foreground">
              {label}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div style={style}>{children}</div>
        {footer}
      </CardContent>
    </Card>
  )
}

interface EmptyStateProps {
  message: string
}

export function EmptyState({ message }: EmptyStateProps) {
  return <div className="py-8 text-center text-muted-foreground">{message}</div>
}

interface ChartTooltipBodyEntry {
  name?: string | number
  value?: number | string | Array<number | string>
  color?: string
}

interface ChartTooltipBodyProps {
  title?: string
  entries: readonly ChartTooltipBodyEntry[]
  formatValue(value: number): string
}

export function ChartTooltipBody({
  title,
  entries,
  formatValue,
}: ChartTooltipBodyProps) {
  const sorted = [...entries].sort((a, b) => {
    const aVal = typeof a.value === "number" ? a.value : 0
    const bVal = typeof b.value === "number" ? b.value : 0
    return bVal - aVal
  })

  if (sorted.length === 0) return null

  return (
    <div className="grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
      {title && <p className="font-medium">{title}</p>}
      {sorted.map((entry, index) => (
        <div key={index} className="flex w-full items-center gap-2">
          <div
            className="h-2.5 w-2.5 shrink-0 rounded-sm"
            style={{ backgroundColor: entry.color }}
          />
          <span className="flex-1">{entry.name}</span>
          <span className="font-medium tabular-nums">
            {typeof entry.value === "number"
              ? formatValue(entry.value)
              : String(entry.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

interface ChartLegendProps {
  keys: string[]
  chartConfig: ChartConfig
  hiddenKeys: Set<string>
  onToggle(key: string): void
  onHover?(key: string | null): void
  className?: string
}

export function ChartLegend({
  keys,
  chartConfig,
  hiddenKeys,
  onToggle,
  onHover,
  className,
}: ChartLegendProps) {
  return (
    <div
      className={cn(
        "grid gap-1.5 [grid-template-columns:repeat(auto-fill,minmax(8rem,1fr))] sm:gap-2 md:[grid-template-columns:repeat(auto-fill,minmax(10rem,1fr))]",
        className
      )}
    >
      {keys.map((key) => {
        const isHidden = hiddenKeys.has(key)
        return (
          <Toggle
            key={key}
            variant="outline"
            size="sm"
            pressed={!isHidden}
            onPressedChange={() => onToggle(key)}
            aria-label={isHidden ? `show ${key}` : `hide ${key}`}
            className={cn(
              "h-auto min-w-0 justify-start gap-1.5 rounded-sm px-2.5 py-1.5 text-xs focus-visible:ring-2 focus-visible:ring-ring md:gap-2 md:px-3 md:py-1.5 md:text-sm",
              isHidden && "opacity-40 line-through"
            )}
            onMouseEnter={() => {
              if (!isHidden) onHover?.(key)
            }}
            onMouseLeave={() => onHover?.(null)}
          >
            <div
              className="h-2.5 w-2.5 shrink-0 rounded-sm md:h-3 md:w-3"
              style={{ backgroundColor: chartConfig[key]?.color }}
            />
            <span className="truncate">{key}</span>
          </Toggle>
        )
      })}
    </div>
  )
}

const emptyStringSet = new Set<string>()

export function useSeriesSelection(allKeys: string[]) {
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const hidden = useMemo(() => {
    if (selected.size === 0) return emptyStringSet
    const h = new Set<string>()
    allKeys.forEach((k) => {
      if (!selected.has(k)) h.add(k)
    })
    return h
  }, [selected, allKeys])

  const onToggle = useCallback((key: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }, [])

  return { hidden, onToggle }
}
