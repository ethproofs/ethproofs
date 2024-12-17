import { headers } from "next/headers"

import Box from "@/components/svgs/box.svg"
import { HeroSection } from "@/components/ui/hero"

export default async function NotFound() {
  const headersList = await headers()
  const pathSegments = headersList.get("referer")?.split("/") || []
  const block = pathSegments[pathSegments.length - 1] || ""

  return (
    <HeroSection className="space-y-4">
      <h1 className="flex flex-col items-center gap-4 font-mono md:flex-row">
        404 <Box strokeWidth="1" className="text-6xl text-primary" />{" "}
        <div className="w-full truncate text-center">
          {typeof block === "string" ? block : ""}
        </div>
      </h1>
      <p className="text-center md:text-start">Proof not found</p>
    </HeroSection>
  )
}
