"use client" // Error boundaries must be Client Components

import { useState } from "react"

import EthproofsIcon from "@/components/svgs/ethproofs-icon.svg"
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
    <div className="mt-16 flex flex-col items-center justify-center gap-4 text-center">
      <EthproofsIcon className="size-40" />
      <h1 className="mb-4 font-normal text-primary">500</h1>
      <p className="text-lg">internal server error</p>
      <Divider className="my-6" />
      <div className="flex flex-col gap-6">
        <Button onClick={handleRefresh} size="lg">
          <RefreshCW className={cn(refreshing && "motion-safe:animate-spin")} />
          refresh page
        </Button>
        <ButtonLink href="/" variant="outline" size="lg">
          back to homepage
        </ButtonLink>
      </div>
    </div>
  )
}
