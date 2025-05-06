"use client"

import { useParams } from "next/navigation"

import LightningBolt from "@/components/svgs/lightning-bolt.svg"
import { ButtonLink } from "@/components/ui/button"
import { Divider } from "@/components/ui/divider"

export default function NotFound() {
  const slug = useParams().slug as string

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <LightningBolt className="size-40 stroke-[0.5px] text-body-secondary" />
      <h1 className="mb-4 font-mono text-3xl text-primary">
        No zkVM found with name {decodeURIComponent(slug)}
      </h1>
      <Divider className="my-6" />
      <ButtonLink href="/zkvms" size="lg">
        Explore all zkVMs
      </ButtonLink>
      <ButtonLink href="/" variant="outline" size="lg">
        Back to homepage
      </ButtonLink>
    </div>
  )
}
