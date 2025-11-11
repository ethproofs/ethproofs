"use client"

import { ExternalLink } from "lucide-react"

import { ButtonLink } from "../ui/button"

import { useIsMobile } from "@/hooks/useIsMobile"

const learnMoreLink = "https://x.com/eth_proofs/status/1930244636582334473"

export function GrantsBanner() {
  const isMobile = useIsMobile()
  return (
    <div className="flex items-center justify-center gap-1 text-sm">
      {isMobile
        ? "$300k in realtime proving grants."
        : "Ethproofs is accelerating realtime proving with $300k in grants."}{" "}
      <ButtonLink
        aria-label="Learn more about the $300k grants"
        variant="ghost"
        size="icon"
        href={learnMoreLink}
      >
        <ExternalLink className="text-primary hover:text-primary-light" />
      </ButtonLink>
    </div>
  )
}
