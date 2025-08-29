"use client"

import { useState } from "react"
import { X as Close } from "lucide-react"

import { Alert, AlertTitle } from "./ui/alert"
import { Button } from "./ui/button"
import Link from "./ui/link"
import Countdown from "./Countdown"

const learnMoreLink = "https://x.com/eth_proofs/status/1961498775865655675"
const deadlineDate = "2025-10-26T00:00:00Z"

const CountdownBanner = () => {
  const [isOpen, setIsOpen] = useState(true)
  const countdownDate = new Date(deadlineDate)

  function onDismiss() {
    setIsOpen(false)
  }

  return (
    isOpen && (
      <Alert className="flex w-full items-center justify-between rounded-2xl border-[1.48px] border-primary-border bg-background-highlight px-6 py-4 text-body">
        <AlertTitle className="w-full text-base">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1">
              <span>
                Ethproofs is making open-source verifiers a requirement. 60 day
                countdown. Learn more
              </span>
              <Link
                className="text-primary hover:text-primary-light"
                href={learnMoreLink}
              >
                here
              </Link>
            </div>
            <Countdown
              targetDate={countdownDate}
              className="origin-center scale-75"
            />
          </div>
        </AlertTitle>
        <Button variant="ghost" onClick={onDismiss} size="icon">
          <Close className="size-4" />
        </Button>
      </Alert>
    )
  )
}

export default CountdownBanner
