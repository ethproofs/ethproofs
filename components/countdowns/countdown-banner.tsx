"use client"

import { useState } from "react"

import { CountdownAlert } from "./countdown-alert"
import { SuccessAlert } from "./success-alert"

interface CountdownBannerProps {
  displayText: string
  deadlineDate: string
  learnMoreLink: string
  successAriaLabel: string
  countdownAriaLabel: string
  isSuccess?: boolean
}

export function CountdownBanner({
  displayText,
  deadlineDate,
  learnMoreLink,
  successAriaLabel,
  countdownAriaLabel,
  isSuccess = false,
}: CountdownBannerProps) {
  const [isOpen, setIsOpen] = useState(true)

  if (!isOpen) return null

  const onDismiss = () => setIsOpen(false)

  return isSuccess ? (
    <SuccessAlert
      displayText={displayText}
      deadlineDate={deadlineDate}
      successAriaLabel={successAriaLabel}
      onDismiss={onDismiss}
    />
  ) : (
    <CountdownAlert
      displayText={displayText}
      deadlineDate={deadlineDate}
      learnMoreLink={learnMoreLink}
      countdownAriaLabel={countdownAriaLabel}
      onDismiss={onDismiss}
    />
  )
}
