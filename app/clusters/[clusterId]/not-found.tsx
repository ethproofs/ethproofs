"use client"
import { Cpu } from "lucide-react"
import { useParams } from "next/navigation"

import { ButtonLink } from "@/components/ui/button"
import { Divider } from "@/components/ui/divider"
import Link from "@/components/ui/link"

import { isUUID } from "@/lib/utils"

import { URL_GITHUB_REPO } from "@/lib/constants"

export default function NotFound() {
  const clusterId = useParams().clusterId as string

  return (
    <div className="mt-40 flex flex-col items-center gap-4 text-center">
      <Cpu className="size-40 stroke-[0.5px] text-body-secondary" />
      {isUUID(clusterId) ? (
        <>
          <h1 className="mb-4 text-3xl text-primary">no cluster found</h1>
          <p className="text-lg">id: {clusterId}</p>
        </>
      ) : (
        <h1 className="mb-4 text-3xl text-primary">cluster not recognized</h1>
      )}
      <p className="text-lg">
        ...if this is a bug, please report it{" "}
        <Link href={URL_GITHUB_REPO}>here</Link>
      </p>
      <Divider className="my-6" />
      <ButtonLink href="/clusters" size="lg">
        explore all clusters
      </ButtonLink>
      <ButtonLink href="/" variant="outline" size="lg">
        back to homepage
      </ButtonLink>
    </div>
  )
}
