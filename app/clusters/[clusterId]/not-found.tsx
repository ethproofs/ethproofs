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
          <h1 className="mb-4 font-mono text-3xl text-primary">
            No cluster found
          </h1>
          <p className="text-lg">ID: {clusterId}</p>
        </>
      ) : (
        <h1 className="mb-4 font-mono text-3xl text-primary">
          Cluster not recognized
        </h1>
      )}
      <p className="text-lg">
        If this a bug please report on our{" "}
        <Link href={URL_GITHUB_REPO}>GitHub</Link> repo
      </p>
      <Divider className="my-6" />
      <ButtonLink href="/clusters" size="lg">
        Explore all clusters
      </ButtonLink>
      <ButtonLink href="/" variant="outline" size="lg">
        Back to homepage
      </ButtonLink>
    </div>
  )
}
