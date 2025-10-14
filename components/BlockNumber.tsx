import Link from "@/components/ui/link"

import { HidePunctuation } from "./StylePunctuation"

import { formatNumber } from "@/lib/number"

interface BlockNumberProps {
  blockNumber: number
}
export function BlockNumber({ blockNumber }: BlockNumberProps) {
  return (
    <Link
      href={`/blocks/${blockNumber}`}
      className="text-primary hover:text-primary-light hover:underline"
    >
      <HidePunctuation>{formatNumber(blockNumber)}</HidePunctuation>
    </Link>
  )
}
