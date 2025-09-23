import { HidePunctuation } from "./StylePunctuation"

import { formatNumber } from "@/lib/number"
import Link from "@/components/ui/link"

interface BlockNumberProps {
  blockNumber: number
}
export function BlockNumber({ blockNumber }: BlockNumberProps) {
  return (
    <Link
      href={`/blocks/${blockNumber}`}
      className="text-sm tracking-wide text-primary"
    >
      <HidePunctuation>{formatNumber(blockNumber)}</HidePunctuation>
    </Link>
  )
}
