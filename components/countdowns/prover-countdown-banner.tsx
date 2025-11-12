"use client"

import { useState } from "react"
import { Check } from "lucide-react"

import { Alert, AlertTitle } from "../ui/alert"
import Link from "../ui/link"

import { Countdown } from "./countdown"

const learnMoreLink = "https://x.com/eth_proofs/status/1963682855373906121"
const deadlineDate = "2025-12-03T00:00:00Z"

interface ProverCountdownBannerProps {
  isSuccess?: boolean
}
export function ProverCountdownBanner({
  isSuccess = false,
}: ProverCountdownBannerProps) {
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
            ? "Reproducible provers requirement achieved"
            : "Reproducible provers requirement countdown"
        }
        className="relative flex border-none bg-accent p-2 text-body"
      >
        <div className="flex w-full items-center justify-between px-2">
          <AlertTitle className="text-base font-normal">
            <span className={isSuccess ? "text-primary-light/80" : undefined}>
              {isSuccess
                ? "provers are all fully reproducible"
                : "reproducible provers required"}
            </span>{" "}
            {isSuccess ? (
              <Check className="inline size-4 text-primary-light/80" />
            ) : (
              <Link
                href={learnMoreLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Learn more about the prover requirement"
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
