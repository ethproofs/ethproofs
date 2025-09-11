import EthproofsLogoTypeface from "@/components/svgs/ethproofs.svg"
import EthproofsLogoIcon from "@/components/svgs/ethproofs-logo-icon.svg"

function EthproofsLogomark() {
  return (
    <div className="mt-1 flex flex-row items-center gap-2">
      <EthproofsLogoIcon className="mb-1 h-10 w-auto rounded-lg border border-primary" />
      <EthproofsLogoTypeface className="h-7 w-auto" />
    </div>
  )
}

export default EthproofsLogomark
