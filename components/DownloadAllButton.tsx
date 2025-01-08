import ArrowDown from "@/components/svgs/arrow-down.svg"

import { cn } from "@/lib/utils"

import { Button } from "./ui/button"

type DownloadAllButtonProps = {
  blockNumber: number
  className?: string
  containerClass?: string
  labelClass?: string
}

const DownloadAllButton = async ({
  blockNumber,
  className,
  labelClass,
}: DownloadAllButtonProps) => {
  const sizingClassName = "h-8 gap-2 self-center text-2xl px-4"

  const labelClassName = cn(
    "inline-block text-nowrap text-xs font-bold font-body",
    labelClass
  )
  return (
    <Button className={cn(sizingClassName, className)} size="icon" asChild>
      <a href={`/api/v0/proofs/download/all/${blockNumber}`} download>
        <ArrowDown />
        <span className={labelClassName}>Download all proofs</span>
        <span className="inline-block text-nowrap text-xs font-bold"></span>
      </a>
    </Button>
  )
}

export default DownloadAllButton
