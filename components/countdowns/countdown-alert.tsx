"use client"

import { ExternalLink } from "lucide-react"

import { Alert, AlertTitle } from "../ui/alert"
import { BaseLink } from "../ui/link"

import { Countdown } from "./countdown"

interface CountdownAlertProps {
  displayText: string
  deadlineDate: string
  learnMoreLink: string
  countdownAriaLabel: string
  onDismiss: () => void
}

export function CountdownAlert({
  displayText,
  deadlineDate,
  learnMoreLink,
  countdownAriaLabel,
  onDismiss,
}: CountdownAlertProps) {
  const countdownDate = new Date(deadlineDate)

  return (
    <BaseLink
      hideArrow
      aria-label={`Learn more about ${displayText}`}
      className="flex w-full"
      href={learnMoreLink}
    >
      <Alert
        role="region"
        aria-label={countdownAriaLabel}
        className="relative flex border-none bg-accent p-2 text-body hover:bg-accent/80"
      >
        <div className="flex w-full items-center justify-between px-2">
          <AlertTitle className="flex items-center gap-2 text-sm font-normal text-body xl:text-base">
            {displayText}
            <ExternalLink className="hidden size-4 text-primary visited:text-primary-visited hover:text-primary-light xl:block" />
          </AlertTitle>
          <Countdown
            targetDate={countdownDate}
            onComplete={onDismiss}
            isSuccess={false}
          />
        </div>
      </Alert>
    </BaseLink>
  )
}
