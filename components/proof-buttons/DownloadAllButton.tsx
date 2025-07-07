"use client"

import { ArrowDown } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"

import { Button } from "../ui/button"

import { useDownloadAllProofs } from "./useDownloadAllProofs"

interface DownloadAllButtonProps {
  blockNumber: string
  className?: string
  containerClass?: string
  labelClass?: string
}

const DownloadAllButton = ({
  blockNumber,
  className,
  labelClass,
}: DownloadAllButtonProps) => {
  const downloadAllProofs = useDownloadAllProofs()

  const sizingClassName = "h-8 gap-2 self-center text-2xl px-4"

  const labelClassName = cn(
    "inline-block text-nowrap text-xs font-bold font-body",
    labelClass
  )
  return (
    <Button
      className={cn(sizingClassName, className)}
      onClick={() =>
        toast.promise(downloadAllProofs(blockNumber), {
          loading: "Loading...",
          success: () => {
            return "All proofs have been downloaded"
          },
          error: "Error downloading proofs",
        })
      }
    >
      <ArrowDown className="size-5" />
      <span className={cn(labelClassName)}>download all proofs</span>
    </Button>
  )
}

export default DownloadAllButton
