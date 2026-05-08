"use client"

import { ArrowDown } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"

import { Button } from "../ui/button"

import { useDownloadRecentClusterProofs } from "./use-download-recent-cluster-proofs"

interface DownloadRecentClusterProofsButtonProps {
  clusterId: string
  limit: number
  className?: string
  labelClass?: string
}

const DownloadRecentClusterProofsButton = ({
  clusterId,
  limit,
  className,
  labelClass,
}: DownloadRecentClusterProofsButtonProps) => {
  const downloadRecentClusterProofs = useDownloadRecentClusterProofs()

  const sizingClassName = "h-8 gap-2 self-center text-2xl px-4"

  const labelClassName = cn(
    "inline-block text-nowrap text-xs font-bold font-body",
    labelClass
  )

  return (
    <Button
      className={cn(sizingClassName, className)}
      onClick={() =>
        toast.promise(downloadRecentClusterProofs(clusterId, limit), {
          loading: "Loading...",
          success: () => "Recent proofs have been downloaded",
          error: "Error downloading proofs",
        })
      }
    >
      <ArrowDown className="size-5" />
      <span className={cn(labelClassName)}>
        download recent proofs ({limit})
      </span>
    </Button>
  )
}

export default DownloadRecentClusterProofsButton
