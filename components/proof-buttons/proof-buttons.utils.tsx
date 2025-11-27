import type { Proof, Team } from "@/lib/types"

export type ProofForDownload = Required<
  Pick<Proof, "proof_status" | "proof_id" | "size_bytes" | "cluster_id">
> & {
  team: Required<Pick<Team, "name" | "slug">>
}

export const proofButtonStateMap = {
  disabled: "disabled",
  download: "download",
  verify: "verify",
  downloading: "downloading",
  verifying: "verifying",
  success: "success",
  failed: "failed",
  error: "error",
} as const

export type ProofButtonState = keyof typeof proofButtonStateMap

export function getProofButtonLabel(buttonState: ProofButtonState) {
  switch (buttonState) {
    case "download":
      return "download"
    case "disabled":
    case "verify":
      return "verify"
    case "downloading":
      return "downloading..."
    case "verifying":
      return "verifying..."
    case "success":
      return "success"
    case "failed":
      return "failed"
    case "error":
      return "error"
    default:
      return ""
  }
}

export function getProofButtonClasses(buttonState: ProofButtonState) {
  const baseClasses =
    "overflow-hidden transition-all duration-300 ease-out flex items-center justify-center"

  switch (buttonState) {
    case "disabled":
      return `${baseClasses} bg-body-secondary/10`
    case "download":
    case "verify":
      return `${baseClasses} border-primary bg-transparent hover:bg-green-500/10`
    case "downloading":
      return `${baseClasses} border-green-300 bg-transparent`
    case "verifying":
      return `${baseClasses} border-green-500 bg-transparent`
    case "success":
      return `${baseClasses} border-green-500 bg-green-500/20`
    case "failed":
    case "error":
      return `${baseClasses} border-destructive bg-transparent`
    default:
      return `${baseClasses} border-primary bg-transparent hover:bg-green-500/10`
  }
}

export function getProofButtonTextColorClass(buttonState: ProofButtonState) {
  switch (buttonState) {
    case "disabled":
      return "text-muted-foreground"
    case "download":
    case "verify":
      return "text-primary"
    case "downloading":
      return "text-green-300"
    case "verifying":
      return "text-green-400"
    case "success":
      return "text-green-500"
    case "failed":
    case "error":
      return "text-destructive"
    default:
      return "text-muted-foreground"
  }
}
