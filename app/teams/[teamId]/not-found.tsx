"use client"

import { useParams } from "next/navigation"

import ProofCircle from "@/components/svgs/proof-circle.svg"
import { ButtonLink } from "@/components/ui/button"
import { Divider } from "@/components/ui/divider"
import Link from "@/components/ui/link"

import { isUUID } from "@/lib/utils"

import { SITE_REPO } from "@/lib/constants"

export default function NotFound() {
  const teamId = useParams().teamId as string

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <ProofCircle className="size-40 stroke-[0.5px] text-body-secondary" />
      {isUUID(teamId) ? (
        <>
          <h1 className="mb-4 font-mono text-3xl text-primary">
            No proving team found
          </h1>
          <p className="text-lg">ID: {teamId}</p>
        </>
      ) : (
        <h1 className="mb-4 font-mono text-3xl text-primary">
          Proving team not recognized
        </h1>
      )}
      <p className="text-lg">
        If this a bug please report on our{" "}
        <Link href={new URL(SITE_REPO, "https://github.com").toString()}>
          GitHub
        </Link>{" "}
        repo
      </p>
      <Divider className="my-6" />
      <ButtonLink href="/teams" size="lg">
        Explore all proving teams
      </ButtonLink>
      <ButtonLink href="/" variant="outline" size="lg">
        Back to homepage
      </ButtonLink>
    </div>
  )
}
