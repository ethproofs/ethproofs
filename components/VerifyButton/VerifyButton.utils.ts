export const verifyButtonStateMap = {
  idle: "idle",
  downloading: "downloading",
  verifying: "verifying",
  verified: "verified",
  failed: "failed",
  error: "error",
} as const

export type VerifyButtonState = keyof typeof verifyButtonStateMap

export function getButtonLabel(buttonState: VerifyButtonState) {
  switch (buttonState) {
    case "idle":
      return "Verify Proof"
    case "downloading":
      return "Downloading..."
    case "verifying":
      return "Verifying..."
    case "verified":
      return "Verified"
    case "failed":
      return "Failed"
    case "error":
      return "Error"
    default:
      return "Verify Proof"
  }
}

export function getButtonClasses(buttonState: VerifyButtonState) {
  const baseClasses =
    "w-full h-full rounded-full border-2 relative overflow-hidden transition-all duration-300 ease-out flex items-center justify-center"

  switch (buttonState) {
    case "idle":
      return `${baseClasses} border-green-500 bg-transparent hover:bg-green-500/10`
    case "downloading":
      return `${baseClasses} border-green-300 bg-transparent`
    case "verifying":
      return `${baseClasses} border-green-500 bg-transparent`
    case "verified":
      return `${baseClasses} border-green-500 bg-green-500/20 shadow-lg shadow-green-500/20`
    case "failed":
    case "error":
      return `${baseClasses} border-red-500 bg-transparent`
    default:
      return `${baseClasses} border-green-500 bg-transparent hover:bg-green-500/10`
  }
}

export function getTextColorClass(buttonState: VerifyButtonState) {
  switch (buttonState) {
    case "idle":
      return "text-green-500"
    case "downloading":
      return "text-green-300"
    case "verifying":
      return "text-green-400"
    case "verified":
      return "text-green-500"
    case "failed":
    case "error":
      return "text-red-500"
    default:
      return "text-green-500"
  }
}
