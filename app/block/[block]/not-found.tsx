import { headers } from "next/headers"

import BlockLarge from "@/components/svgs/block-large.svg"
import { HeroSection } from "@/components/ui/hero"

export default async function NotFound() {
  const headersList = await headers()
  const pathSegments = headersList.get("referer")?.split("/") || []
  const block = pathSegments[pathSegments.length - 1] || ""

  return (
    <HeroSection className="space-y-4">
      <h1 className="flex flex-col items-center gap-4 font-mono md:flex-row">
        404 <BlockLarge className="inline text-6xl text-primary" />{" "}
        {typeof block === "string" ? block : ""}
      </h1>
      <p className="text-center md:text-start">Proof not found</p>
    </HeroSection>
  )
}
