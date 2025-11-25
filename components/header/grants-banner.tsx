"use client"

import Link from "../ui/link"

import { useIsMobile } from "@/lib/hooks/ui/use-is-mobile"

const learnMoreLink = "https://x.com/eth_proofs/status/1930244636582334473"

export function GrantsBanner() {
  const isMobile = useIsMobile()
  return (
    <div className="flex items-center justify-center gap-1 text-sm">
      {isMobile
        ? "$300k in realtime proving grants."
        : "Ethproofs is accelerating realtime proving with $300k in grants."}{" "}
      <Link
        href={learnMoreLink}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Learn more about the verifier requirement"
      />
    </div>
  )
}
