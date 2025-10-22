"use client"

import { useState } from "react"

import { Countdown } from "../Countdown"
import { Alert, AlertTitle } from "../ui/alert"
import Link from "../ui/link"

const learnMoreLink = "https://x.com/eth_proofs/status/1963682855373906121"
const deadlineDate = "2025-12-03T00:00:00Z"

export function ProverCountdownBanner() {
  const [isOpen, setIsOpen] = useState(true)
  const countdownDate = new Date(deadlineDate)

  function onDismiss() {
    setIsOpen(false)
  }

  return (
    isOpen && (
      <Alert
        role="region"
        aria-label="Reproducible provers requirement countdown"
        className="relative flex rounded-2xl border-[1.48px] border-primary-border bg-background-highlight p-4 text-body"
      >
        <div className="flex w-full flex-col items-center gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <AlertTitle>
            <span>reproducible provers required</span>{" "}
            <Link
              className="text-xl text-primary hover:text-primary-light"
              href={learnMoreLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Learn more about the prover requirement"
            />
          </AlertTitle>
          <Countdown
            targetDate={countdownDate}
            className="origin-center scale-75"
            onComplete={onDismiss}
          />
        </div>
      </Alert>
    )
  )
}
