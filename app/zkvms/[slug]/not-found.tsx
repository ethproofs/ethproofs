"use client"

import { Zap } from "lucide-react"
import { useParams } from "next/navigation"

import { ButtonLink } from "@/components/ui/button"
import { Divider } from "@/components/ui/divider"
import Link from "@/components/ui/link"

import { URL_GITHUB_REPO } from "@/lib/constants"

export default function NotFound() {
  const slug = useParams().slug as string

  return (
    <div className="mt-40 flex flex-col items-center gap-4 text-center">
      <Zap className="size-40 stroke-[0.5px] text-body-secondary" />
      <h1 className="mb-4 font-mono text-3xl text-primary">
        no zkVM found with name {decodeURIComponent(slug)}
      </h1>
      <p className="text-lg">
        ...if this is a bug, please report it{" "}
        <Link href={URL_GITHUB_REPO}>here</Link>
      </p>
      <Divider className="my-6" />
      <ButtonLink href="/zkvms" size="lg">
        explore all zkVMs
      </ButtonLink>
      <ButtonLink href="/" variant="outline" size="lg">
        back to homepage
      </ButtonLink>
    </div>
  )
}
