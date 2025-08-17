"use client"

import { Box } from "lucide-react"
import { useParams } from "next/navigation"

import { HidePunctuation } from "@/components/StylePunctuation"
import { ButtonLink } from "@/components/ui/button"
import { Divider } from "@/components/ui/divider"
import Link from "@/components/ui/link"

import { URL_GITHUB_REPO } from "@/lib/constants"

import { getBlockValueType } from "@/lib/blocks"
import { formatNumber } from "@/lib/number"

export default function NotFound() {
  const block = useParams().block as string
  const blockType = getBlockValueType(block)

  return (
    <div className="mt-40 flex flex-col items-center gap-4 text-center">
      <Box className="size-40 stroke-[0.5px] text-body-secondary" />
      <h1 className="mb-4 font-mono text-3xl text-primary">
        no block found with proofs
      </h1>
      <p className="max-w-screen-lg text-lg">
        the block{" "}
        {blockType === "hash" ? (
          <>
            with hash{" "}
            <span className="break-all font-mono text-body-secondary">
              {block}
            </span>
          </>
        ) : (
          <span className="text-body-secondary">
            <HidePunctuation>{formatNumber(+block)}</HidePunctuation>
          </span>
        )}{" "}
        does not have proofs or was not proven by any of our supported providers
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
