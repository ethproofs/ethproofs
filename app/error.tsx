"use client" // Error boundaries must be Client Components

import ProofCircle from "@/components/svgs/proof-circle.svg"
import { HeroSection } from "@/components/ui/hero"

export default function Error() {
  return (
    <HeroSection className="space-y-4">
      <h1 className="flex flex-col items-center gap-4 font-mono md:flex-row">
        500 <ProofCircle className="inline text-primary" />
      </h1>
      <p className="text-center md:text-start">Internal server error</p>
    </HeroSection>
  )
}
