"use client"

import { useCallback, useEffect, useState } from "react"

import { cn } from "@/lib/utils"

type TimeUnit = {
  value: number
  label: string
}

interface CountdownProps {
  targetDate: Date
  title?: string
  className?: string
  onComplete?: () => void
  isSuccess?: boolean
}
export function Countdown({
  targetDate,
  title,
  className,
  onComplete,
  isSuccess = false,
}: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeUnit[]>([])

  const calculateTimeLeft = useCallback(() => {
    const now = new Date().getTime()
    const target = targetDate.getTime()
    const difference = target - now

    if (difference <= 0) {
      if (isSuccess) return
      setTimeLeft([])
      onComplete?.()
      return
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24))
    const hours = Math.floor(
      (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    )
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((difference % (1000 * 60)) / 1000)

    const units: TimeUnit[] = []

    if (days > 0) units.push({ value: days, label: "days" })
    if (hours > 0 || days > 0) units.push({ value: hours, label: "hours" })
    if (minutes > 0 || hours > 0 || days > 0)
      units.push({
        value: minutes,
        label: "minutes",
      })
    units.push({
      value: seconds,
      label: "seconds",
    })

    setTimeLeft(units)
  }, [targetDate, isSuccess, onComplete])

  useEffect(() => {
    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [calculateTimeLeft])

  const defaultUnits = isSuccess
    ? [
        { value: 0, label: "days" },
        { value: 0, label: "hours" },
        { value: 0, label: "minutes" },
        { value: 0, label: "seconds" },
      ]
    : timeLeft

  return (
    <div className={cn("text-center", className)}>
      {title && <h3 className="mb-4 text-lg font-semibold">{title}</h3>}

      <div className="flex justify-center gap-1 sm:gap-4">
        {defaultUnits.map((unit, _idx) => (
          <div key={unit.label} className="flex min-w-8 flex-col items-center">
            <div
              className={cn(
                "text-sm font-bold sm:text-base",
                isSuccess ? "text-muted-foreground" : undefined
              )}
            >
              {unit.value.toString().padStart(2, "0")}
            </div>
            <div className="text-xxs mt-0.5 uppercase tracking-tight text-muted-foreground">
              {unit.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
