"use client"

import { Box } from "lucide-react"

import { ButtonLink } from "@/components/ui/button"
import { Divider } from "@/components/ui/divider"
import Link from "@/components/ui/link"

import { URL_GITHUB_REPO } from "@/lib/constants"

export default function Error() {
  return (
    <div className="mt-40 flex flex-col items-center gap-4 text-center">
      <Box className="size-40 stroke-[0.5px] text-body-secondary" />
      <h1 className="mb-4 font-mono text-3xl text-primary">
        block not recognized
      </h1>
      <p className="text-lg">
        the block provided is not a valid number or a hash
      </p>
      <p className="text-lg">
        ...if this is a bug, please report it{" "}
        <Link href={URL_GITHUB_REPO}>here</Link>
      </p>
      <Divider className="my-6" />
      <ButtonLink href="/blocks" size="lg">
        explore all blocks
      </ButtonLink>
      <ButtonLink href="/" variant="outline" size="lg">
        back to homepage
      </ButtonLink>
    </div>
  )
}
