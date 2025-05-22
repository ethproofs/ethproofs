"use client" // Error boundaries must be Client Components

import { useState } from "react"

import ProofCircle from "@/components/svgs/proof-circle.svg"
import RefreshCW from "@/components/svgs/refresh-cw.svg"
import { Button, ButtonLink } from "@/components/ui/button"
import { Divider } from "@/components/ui/divider"

import { cn } from "@/lib/utils"

export default function Error() {
  const [refreshing, setRefreshing] = useState(false)
  const handleRefresh = () => {
    setRefreshing(true)
    window.location.reload()
  }
  return (
    <div className="mt-40 flex flex-col items-center gap-4 text-center">
      <ProofCircle className="size-40 -translate-x-4 stroke-[1.25px] text-primary" />
      <h1 className="mb-4 font-mono font-normal text-primary">500</h1>
      <p className="text-lg">Internal server error</p>
      <Divider className="my-6" />
      <div className="flex flex-col gap-6">
        <Button onClick={handleRefresh} size="lg">
          <RefreshCW className={cn(refreshing && "motion-safe:animate-spin")} />
          Refresh page
        </Button>
        <ButtonLink href="/" variant="outline" size="lg">
          Back to homepage
        </ButtonLink>
      </div>
    </div>
  )
}
