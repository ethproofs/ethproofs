"use client"

import { useState } from "react"
import { X as Close } from "lucide-react"

import { Alert, AlertDescription } from "./ui/alert"
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
      <Alert 
        role="region"
        aria-label="Open‑source verifier requirement countdown"
        className="relative flex w-full flex-col items-start justify-between gap-4 rounded-2xl border-[1.48px] border-primary-border bg-background-highlight px-4 py-4 text-body sm:flex-row sm:items-center sm:px-6 sm:gap-2"
      >
        <AlertDescription className="w-full text-base">
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center">
              <span className="leading-relaxed">
                Ethproofs is making open-source verifiers a requirement. 60 day
                countdown.{" "}
                <Link
                  className="text-primary hover:text-primary-light"
                  href={learnMoreLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Learn more about the verifier requirement"
                >
                  Learn more
                </Link>
              </span>
            </div>
            <Countdown
              targetDate={countdownDate}
              className="origin-center scale-75"
              onComplete={onDismiss}
            />
          </div>
        </AlertDescription>
        <Button 
          type="button"
          aria-label="Dismiss countdown banner"
          variant="ghost" 
          onClick={onDismiss} 
          size="icon"
          className="absolute right-2 top-2 sm:relative sm:right-0 sm:top-0"
        >
          <Close className="size-4" aria-hidden="true" />
        </Button>
      </Alert>
    )
  )
}

export default CountdownBanner
