import { ButtonLink } from "@/components/ui/button"
import { HeroSection } from "@/components/ui/hero"

export default async function NotFound() {
  return (
    <>
      <HeroSection className="space-y-4">
        <h1 className="flex flex-col items-center gap-4 font-mono text-5xl md:flex-row">
          404
        </h1>
        <p className="text-center font-mono md:text-start">Page not found</p>
      </HeroSection>
      <div className="justify-center p-6 max-md:flex">
        <ButtonLink href="/" className="mx-auto h-fit w-fit" size="lg">
          View all proofs
        </ButtonLink>
      </div>
    </>
  )
}
