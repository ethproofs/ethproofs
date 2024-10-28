import { type Metadata } from "next"

import {
  HeroSection,
  HeroTitle,
  HeroDivider,
  HeroBody,
  HeroItem,
  HeroItemLabel,
} from "@/components/ui/hero"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import Globe from "@/components/svgs/globe.svg"
import GitHub from "@/components/svgs/github.svg"
import InfoCircle from "@/components/svgs/info-circle.svg"
import ProofCircle from "@/components/svgs/proof-circle.svg"
import SuccinctLogo from "@/components/svgs/succinct-logo.svg"
import TrendingUp from "@/components/svgs/trending-up.svg"
import XLogo from "@/components/svgs/x-logo.svg"

import { SITE_NAME } from "@/lib/constants"
import { createClient } from "@/utils/supabase/client"
import { getHost } from "@/lib/url"
import LearnMore from "@/components/LearnMore"
import Link from "next/link"

type ProverPageProps = {
  params: Promise<{ proverId: number }>
}

export async function generateMetadata({
  params,
}: ProverPageProps): Promise<Metadata> {
  const { proverId } = await params
  const proverName = `${proverId}` // TODO: Get prover name
  return {
    title: `${proverName} - ${SITE_NAME}`,
  }
}

export default async function ProverPage({ params }: ProverPageProps) {
  const { proverId } = await params
  const proverName = `${proverId}` // TODO: Get prover name

  const supabase = createClient()

  const { data, error } = await supabase
    .from("proofs")
    .select("*, proofs(*)")
    .eq("prover_machine_id", proverId)
    .single()

  // TODO: Dummy profile—Get prover profile info
  const profile = {
    proverName: "Succinct",
    logo: () => <SuccinctLogo />,
    contact: {
      url: "https://succinct.xyz",
      twitter: "succinctLabs",
      github: "succinctlabs",
    },
  }
  // const proofs = [] as string[]

  // if (!data || error) {
  //   return (
  //     <HeroSection className="space-y-4">
  //       <h1 className="flex flex-col items-center gap-4 font-mono md:flex-row">
  //         404 <ProofCircle className="text-//6xl inline text-primary" />{" "}
  //         {proverId}
  //       </h1>
  //       <p className="text-center md:text-start">Prover not found</p>
  //     </HeroSection>
  //   )
  // }

  type PerformanceItem = {
    label: string
    description: string
    value: string
  }
  const performanceItems: PerformanceItem[] = [
    {
      label: "Total proofs",
      description: "TODO: Add tooltip description",
      value: String(987989), // TODO: Plug in real data
    },
    {
      label: "Avg  zkVM cycles per proof",
      description: "TODO: Add tooltip description",
      value: new Intl.NumberFormat("en-US").format(2_391_801_856), // TODO: Plug in real data
    },
    {
      label: "Prover total fees ",
      description: "TODO: Add tooltip description",
      value: new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        notation: "compact",
      }).format(999_000_000), // TODO: Plug in real data
    },
    {
      label: "Avg cost / proof",
      description: "TODO: Add tooltip description",
      value: new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(1.99), // TODO: Plug in real data
    },
  ]

  return (
    <div className="space-y-8">
      <HeroSection>
        <HeroTitle className="items-center py-6">
          <profile.logo />
          <h1 className="font-mono text-3xl font-semibold">{proverName}</h1>
        </HeroTitle>

        <HeroDivider />

        <HeroBody>
          <HeroItem className="hover:underline">
            <Link href={profile.contact.url}>
              <HeroItemLabel className="text-body">
                <Globe className="text-body-secondary" />
                {getHost(profile.contact.url)}
              </HeroItemLabel>
            </Link>
          </HeroItem>
          <HeroItem className="hover:underline">
            <Link
              href={new URL(
                profile.contact.twitter,
                "https://x.com/"
              ).toString()}
            >
              <HeroItemLabel className="text-body">
                <XLogo className="text-body-secondary" /> @
                {profile.contact.twitter}
              </HeroItemLabel>
            </Link>
          </HeroItem>
          <HeroItem className="hover:underline">
            <Link href={new URL(profile.contact.github, "https://github.com")}>
              <HeroItemLabel className="text-body">
                <GitHub className="text-body-secondary" />
                {profile.contact.github}
              </HeroItemLabel>
            </Link>
          </HeroItem>
        </HeroBody>
      </HeroSection>

      <section>
        <h2 className="flex items-center gap-2 text-lg font-normal text-primary">
          <TrendingUp /> Prover performance
        </h2>
        <div className="flex flex-wrap gap-x-8">
          {performanceItems.map(({ label, description, value }) => (
            <div key={label} className="space-y-0.5 px-2 py-3">
              <div className="flex items-center gap-2 text-sm text-body-secondary">
                {label}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoCircle />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="text-2xl font-semibold">{value}</div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="flex items-center gap-2 text-lg font-normal text-primary">
          <ProofCircle /> Proofs
        </h2>
        {/* TODO: Data table of proofs for prover */}
      </section>

      <LearnMore />
    </div>
  )
}
