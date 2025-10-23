"use client"

import { useState } from "react"
import { CheckCheck } from "lucide-react"

import { Countdown } from "../Countdown"
import { Alert, AlertTitle } from "../ui/alert"
import Link from "../ui/link"

const learnMoreLink = "https://x.com/eth_proofs/status/1961498775865655675"
const deadlineDate = "2025-10-26T00:00:00Z"

interface VerifierCountdownBannerProps {
  isSuccess?: boolean
}
export function VerifierCountdownBanner({
  isSuccess = false,
}: VerifierCountdownBannerProps) {
  const [isOpen, setIsOpen] = useState(true)
  const countdownDate = new Date(deadlineDate)

  function onDismiss() {
    setIsOpen(false)
  }

  return (
    isOpen && (
      <Alert
        role="region"
        aria-label={
          isSuccess
            ? "Open-source verifier requirement achieved"
            : "Open‑source verifier requirement countdown"
        }
        className="relative flex rounded-2xl border-[1.48px] border-primary-border bg-background-highlight p-4 text-body"
      >
        <div className="flex w-full flex-col items-center gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <AlertTitle>
            <span className={isSuccess ? "text-primary" : undefined}>
              {isSuccess
                ? "all verifiers are now open‑source"
                : "open‑source verifiers required"}
            </span>{" "}
            {isSuccess ? (
              <CheckCheck className="inline size-5 text-primary hover:text-primary-light" />
            ) : (
              <Link
                className="text-xl text-primary hover:text-primary-light"
                href={learnMoreLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Learn more about the verifier requirement"
              />
            )}
          </AlertTitle>
          <Countdown
            targetDate={countdownDate}
            className="origin-center scale-75"
            onComplete={onDismiss}
            isSuccess={isSuccess}
          />
        </div>
      </Alert>
    )
  )
}
