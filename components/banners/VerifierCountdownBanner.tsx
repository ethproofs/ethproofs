"use client"

import { useState } from "react"

import Countdown from "../Countdown"
import { Alert, AlertTitle } from "../ui/alert"
import Link from "../ui/link"

const learnMoreLink = "https://x.com/eth_proofs/status/1961498775865655675"
const deadlineDate = "2025-10-26T00:00:00Z"

const VerifierCountdownBanner = () => {
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
        className="relative flex rounded-2xl border p-4 text-body"
      >
        <div className="flex w-full flex-col items-center gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <AlertTitle>
            <span>open‑source verifiers required</span>{" "}
            <Link
              className="text-xl text-primary hover:text-primary-light"
              href={learnMoreLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Learn more about the verifier requirement"
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

export default VerifierCountdownBanner
