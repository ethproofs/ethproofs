"use client"

import { CheckCheck } from "lucide-react"

import { Alert, AlertTitle } from "../ui/alert"

import { Countdown } from "./countdown"

interface SuccessAlertProps {
  displayText: string
  deadlineDate: string
  successAriaLabel: string
  onDismiss: () => void
}

export function SuccessAlert({
  displayText,
  deadlineDate,
  successAriaLabel,
  onDismiss,
}: SuccessAlertProps) {
  const countdownDate = new Date(deadlineDate)

  return (
    <Alert
      role="region"
      aria-label={successAriaLabel}
      className="relative flex border-none bg-accent p-2 text-body"
    >
      <div className="flex w-full items-center justify-between px-2">
        <AlertTitle className="flex items-center gap-2 text-sm font-normal text-primary xl:text-base">
          {displayText}
          <CheckCheck className="hidden size-4 xl:block" />
        </AlertTitle>
        <Countdown
          targetDate={countdownDate}
          onComplete={onDismiss}
          isSuccess
        />
      </div>
    </Alert>
  )
}
