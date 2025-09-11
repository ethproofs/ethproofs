"use client"

import { useParams } from "next/navigation"

import EthproofsIcon from "@/components/svgs/ethproofs-icon.svg"
import { ButtonLink } from "@/components/ui/button"
import { Divider } from "@/components/ui/divider"
import Link from "@/components/ui/link"

import { isUUID } from "@/lib/utils"

import { URL_GITHUB_REPO } from "@/lib/constants"

export default function NotFound() {
  const teamId = useParams().teamId as string

  return (
    <div className="mt-40 flex flex-col items-center gap-4 text-center">
      <EthproofsIcon className="size-40" />
      {isUUID(teamId) ? (
        <>
          <h1 className="mb-4 text-3xl text-primary">no proving team found</h1>
          <p className="text-lg">id: {teamId}</p>
        </>
      ) : (
        <h1 className="mb-4 text-3xl text-primary">
          proving team not recognized
        </h1>
      )}
      <p className="text-lg">
        ...if this is a bug, please report it{" "}
        <Link href={URL_GITHUB_REPO}>here</Link>
      </p>
      <Divider className="my-6" />
      <ButtonLink href="/teams" size="lg">
        explore all proving teams
      </ButtonLink>
      <ButtonLink href="/" variant="outline" size="lg">
        back to homepage
      </ButtonLink>
    </div>
  )
}
