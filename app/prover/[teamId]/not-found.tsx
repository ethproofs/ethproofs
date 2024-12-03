import ProofCircle from "@/components/svgs/proof-circle.svg"
import { HeroSection } from "@/components/ui/hero"

export default async function NotFound() {
  return (
    <HeroSection className="space-y-4">
      <h1 className="flex flex-col items-center gap-4 font-mono md:flex-row">
        404 <ProofCircle className="inline text-primary" />
      </h1>
      <p className="text-center md:text-start">Prover not found</p>
    </HeroSection>
  )
}
