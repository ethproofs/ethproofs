import Link from "next/link"

import { HidePunctuation } from "./StylePunctuation"

import { formatNumber } from "@/lib/number"

const BlockNumber = ({ blockNumber }: { blockNumber: number }) => {
  return (
    <Link
      href={`/blocks/${blockNumber}`}
      className="text-lg tracking-wide text-primary hover:text-primary-light hover:underline"
    >
      <HidePunctuation>{formatNumber(blockNumber)}</HidePunctuation>
    </Link>
  )
}

export default BlockNumber
