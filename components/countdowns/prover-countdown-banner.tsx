"use client"

import { useState } from "react"
import { CheckCheck } from "lucide-react"

import { cn } from "@/lib/utils"

import { Alert, AlertTitle } from "../ui/alert"
import Link, { BaseLink } from "../ui/link"

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

  const displayText = isSuccess
    ? "provers are all fully reproducible"
    : "reproducible provers required"

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
              ? "Reproducible provers requirement achieved"
              : "Reproducible provers requirement countdown"
          }
          className="relative flex border-none bg-accent p-2 text-body hover:bg-accent/80"
        >
          <div className="flex w-full items-center justify-between px-2">
            <AlertTitle
              className={cn(
                "flex items-center gap-1 text-sm font-normal xl:text-base",
                isSuccess ? "text-primary" : "text-body"
              )}
            >
              {displayText}
              <Link
                aria-label="Learn more about the prover requirement"
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
