"use client"

import { useEffect, useRef, useState } from "react"

import RefreshCW from "@/components/svgs/refresh-cw.svg"
import { Button, ButtonLink } from "@/components/ui/button"
import { Divider } from "@/components/ui/divider"

import { cn } from "@/lib/utils"

const maxRetries = 3

interface CspBenchmarksErrorProps {
  error: Error & { digest?: string }
  reset(): void
}

export default function CspBenchmarksError({
  error,
  reset,
}: CspBenchmarksErrorProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const retryCount = useRef(0)
  const hasExhaustedRetries = retryCount.current >= maxRetries

  useEffect(() => {
    console.error(error)
  }, [error])

  useEffect(() => {
    if (!isRefreshing) return
    const id = setTimeout(() => setIsRefreshing(false), 3000)
    return () => clearTimeout(id)
  }, [isRefreshing])

  const handleRefresh = () => {
    retryCount.current += 1
    setIsRefreshing(true)
    reset()
  }

  return (
    <div className="mt-40 flex flex-col items-center gap-4 text-center">
      <h1 className="mb-4 text-3xl text-primary">unable to load benchmarks</h1>
      <p className="text-lg">
        something went wrong while fetching benchmark data
      </p>
      {hasExhaustedRetries && (
        <p className="text-sm text-muted-foreground">
          retried {maxRetries} times without success, try again later
        </p>
      )}
      <Divider className="my-6" />
      <div className="flex flex-col gap-6">
        <Button
          onClick={handleRefresh}
          size="lg"
          disabled={hasExhaustedRetries}
        >
          <RefreshCW
            className={cn(isRefreshing && "motion-safe:animate-spin")}
          />
          {hasExhaustedRetries ? "retry limit reached" : "refresh page"}
        </Button>
        <ButtonLink href="/" variant="outline" size="lg">
          back to homepage
        </ButtonLink>
      </div>
    </div>
  )
}
