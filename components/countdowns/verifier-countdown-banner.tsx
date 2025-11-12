"use client"

import { useState } from "react"
import { Check } from "lucide-react"

import { Alert, AlertTitle } from "../ui/alert"
import Link from "../ui/link"

import { Countdown } from "./countdown"

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
        className="relative flex border-none bg-accent p-2 text-body"
      >
        <div className="flex w-full items-center justify-between px-2">
          <AlertTitle className="text-base font-normal">
            <span className={isSuccess ? "text-primary-light/80" : undefined}>
              {isSuccess
                ? "all verifiers are now open‑source"
                : "open‑source verifiers required"}
            </span>{" "}
            {isSuccess ? (
              <Check className="inline size-4 text-primary-light/80" />
            ) : (
              <Link
                href={learnMoreLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Learn more about the verifier requirement"
              />
            )}
          </AlertTitle>
          <Countdown
            targetDate={countdownDate}
            onComplete={onDismiss}
            isSuccess={isSuccess}
          />
        </div>
      </Alert>
    )
  )
}
