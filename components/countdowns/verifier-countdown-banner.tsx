"use client"

import { useState } from "react"
import { CheckCheck } from "lucide-react"

import { cn } from "@/lib/utils"

import { Alert, AlertTitle } from "../ui/alert"
import Link, { BaseLink } from "../ui/link"

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

  const displayText = isSuccess
    ? "all verifiers are now open‑source"
    : "open‑source verifiers required"

  return (
    isOpen && (
      <BaseLink
        hideArrow
        aria-label="Learn more about the prover requirement"
        className="flex w-full"
        href={learnMoreLink}
      >
        <Alert
          role="region"
          aria-label={
            isSuccess
              ? "Open-source verifier requirement achieved"
              : "Open‑source verifier requirement countdown"
          }
          className="relative flex border-none bg-accent p-2 text-body hover:bg-accent/80"
        >
          <div className="flex w-full items-center justify-between px-2">
            <AlertTitle
              className={cn(
                "flex items-center gap-1 text-sm font-normal md:text-base",
                isSuccess ? "text-primary" : "text-body"
              )}
            >
              {displayText}
              <Link
                aria-label="Learn more about the verifier requirement"
                className="hidden font-body text-primary visited:text-primary-visited hover:text-primary-light xl:block"
                href={learnMoreLink}
                hideArrow={isSuccess}
              />
              {isSuccess ? (
                <CheckCheck className="hidden size-4 xl:block" />
              ) : null}
            </AlertTitle>
            <Countdown
              targetDate={countdownDate}
              onComplete={onDismiss}
              isSuccess={isSuccess}
            />
          </div>
        </Alert>
      </BaseLink>
    )
  )
}
