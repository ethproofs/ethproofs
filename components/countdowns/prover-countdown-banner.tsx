import { CountdownBanner } from "./countdown-banner"

const learnMoreLink = "https://x.com/eth_proofs/status/1963682855373906121"
const deadlineDate = "2025-12-03T00:00:00Z"

interface ProverCountdownBannerProps {
  isSuccess?: boolean
}

export function ProverCountdownBanner({
  isSuccess = false,
}: ProverCountdownBannerProps) {
  return (
    <CountdownBanner
      displayText={
        isSuccess
          ? "provers are all fully reproducible"
          : "reproducible provers required"
      }
      deadlineDate={deadlineDate}
      learnMoreLink={learnMoreLink}
      successAriaLabel="Reproducible provers requirement achieved"
      countdownAriaLabel="Reproducible provers requirement countdown"
      isSuccess={isSuccess}
    />
  )
}
