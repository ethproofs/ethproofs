import { CountdownBanner } from "./countdown-banner"

const learnMoreLink = "https://x.com/eth_proofs/status/1961498775865655675"
const deadlineDate = "2025-10-26T00:00:00Z"

interface VerifierCountdownBannerProps {
  isSuccess?: boolean
}

export function VerifierCountdownBanner({
  isSuccess = false,
}: VerifierCountdownBannerProps) {
  return (
    <CountdownBanner
      displayText={
        isSuccess
          ? "all verifiers are now open‑source"
          : "open‑source verifiers required"
      }
      deadlineDate={deadlineDate}
      learnMoreLink={learnMoreLink}
      successAriaLabel="Open-source verifier requirement achieved"
      countdownAriaLabel="Open‑source verifier requirement countdown"
      isSuccess={isSuccess}
    />
  )
}
