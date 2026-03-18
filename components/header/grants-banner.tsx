"use client"

import Link from "../ui/link"

import { useIsMobile } from "@/lib/hooks/ui/use-is-mobile"

const learnMoreLink =
  "https://ethproofs.org/blog/the-ethproofs-on-prem-proving-initiative-updated-real-time-proving-grants"

export function GrantsBanner() {
  const isMobile = useIsMobile()
  return (
    <div className="flex items-center justify-center gap-1 text-sm">
      {isMobile
        ? "$300k in real-time proving grants."
        : "Ethproofs is accelerating real-time proving with $300k in grants."}{" "}
      <Link
        href={learnMoreLink}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Learn more about the real-time proving grants"
      />
    </div>
  )
}
