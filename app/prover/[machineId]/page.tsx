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
import { formatNumber } from "@/lib/number"

type ProverPageProps = {
  params: Promise<{ machineId: number }>
}

export async function generateMetadata({
  params,
}: ProverPageProps): Promise<Metadata> {
  const { machineId } = await params

  const supabase = createClient()

  const { data: machine, error: machineError } = await supabase
    .from("prover_machines")
    .select("*")
    .eq("machine_id", machineId)
    .single()

  if (machineError || !machine)
    return { title: `Prover not found - ${SITE_NAME}` }

  return {
    title: `${machine.machine_name} - ${SITE_NAME}`,
  }
}

export default async function ProverPage({ params }: ProverPageProps) {
  const { machineId } = await params

  const supabase = createClient()

  const { data: machine, error: machineError } = await supabase
    .from("prover_machines")
    .select("*")
    .eq("machine_id", machineId)
    .single()

  const { data: proofs, error: proofError } = await supabase
    .from("proofs")
    .select("*")
    .eq("prover_machine_id", machineId)

  // TODO: Dummy profile—Get prover profile info
  const profile = {
    proverName: machine?.machine_name, // ✅
    logo: () => <SuccinctLogo />, // TODO: Get prover logo from DB
    contact: {
      url: "https://succinct.xyz",
      twitter: "succinctLabs",
      github: "succinctlabs",
    },
  }

  if (!machine || machineError || !proofs?.length || proofError) {
    return (
      <HeroSection className="space-y-4">
        <h1 className="flex flex-col items-center gap-4 font-mono md:flex-row">
          404 <ProofCircle className="text-//6xl inline text-primary" />{" "}
          {machineId}
        </h1>
        <p className="text-center md:text-start">Prover not found</p>
      </HeroSection>
    )
  }

  const totalProofs = proofs.length
  const avgZkVMCyclesPerProof = proofs.reduce(
    (acc, proof) => acc + (proof.proving_cycles as number),
    0
  )
  const proverTotalFees = proofs.reduce(
    (acc, proof) => acc + (proof.proving_cost as number),
    0
  )
  const avgCostPerProof = proverTotalFees / totalProofs

  const performanceItems = [
    {
      label: "Total proofs",
      description: "The total number of proofs generated by this prover.", // TODO: Add proper descriptions
      value: formatNumber(totalProofs),
    },
    {
      label: "Avg zkVM cycles per proof",
      description:
        "The average number of zkVM cycles required to generate a proof.", // TODO: Add proper descriptions
      value: formatNumber(avgZkVMCyclesPerProof),
    },
    {
      label: "Prover total fees",
      description:
        "The total fees accumulated by the prover for generating proofs.", // TODO: Add proper descriptions
      value: formatNumber(proverTotalFees, {
        style: "currency",
        currency: "USD",
        notation: "compact",
      }),
    },
    {
      label: "Avg cost per proof",
      description: "The average cost incurred for generating a single proof.", // TODO: Add proper descriptions
      value: formatNumber(avgCostPerProof, {
        style: "currency",
        currency: "USD",
      }),
    },
  ]

  return (
    <div className="space-y-8">
      <HeroSection>
        <HeroTitle className="items-center py-6">
          <profile.logo />
          <h1 className="font-mono text-3xl font-semibold">
            {machine.machine_name}
          </h1>
        </HeroTitle>

        <HeroDivider />

        <HeroBody>
          <HeroItem className="hover:underline">
            <Link
              target="_blank"
              rel="noopener noreferrer"
              href={profile.contact.url}
            >
              <HeroItemLabel className="text-body">
                <Globe className="text-body-secondary" />
                {getHost(profile.contact.url)}
              </HeroItemLabel>
            </Link>
          </HeroItem>
          <HeroItem className="hover:underline">
            <Link
              target="_blank"
              rel="noopener noreferrer"
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
            <Link
              target="_blank"
              rel="noopener noreferrer"
              href={new URL(
                profile.contact.github,
                "https://github.com"
              ).toString()}
            >
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