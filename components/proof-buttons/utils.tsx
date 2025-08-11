export const handleBlobRead = async (blob: Blob): Promise<Uint8Array> => {
  const buf = await blob.arrayBuffer()
  return new Uint8Array(buf)
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
      return `${baseClasses} border-green-500 bg-green-500/20 shadow-lg shadow-green-500/20`
    case "failed":
    case "error":
      return `${baseClasses} border-red-500 bg-transparent`
    default:
      return `${baseClasses} border-primary bg-transparent hover:bg-green-500/10`
  }
}

export function getProofButtonTextColorClass(buttonState: ProofButtonState) {
  switch (buttonState) {
    case "disabled":
      return "text-body-secondary"
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
      return "text-red-500"
    default:
      return "text-body-secondary"
  }
}
