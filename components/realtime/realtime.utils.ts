export type ProofStatus =
  | "queued"
  | "proving"
  | "proved"
  | "downloading"
  | "verifying"
  | "success"
  | "failed"
  | "error"

export function getProofStatusText(proofStatus: ProofStatus) {
  switch (proofStatus) {
    case "queued":
      return "queued"
    case "proving":
      return "proving"
    case "proved":
      return "proved"
    case "downloading":
      return "fetching proof"
    case "verifying":
      return "verifying"
    case "success":
      return "verified"
    case "failed":
      return "proved (verification failed)"
    case "error":
      return "proved (verification error)"
    default:
      return "unknown"
  }
}

export function getProofStatusProgressValue(proofStatus: ProofStatus) {
  switch (proofStatus) {
    case "queued":
      return 20
    case "proving":
      return 40
    case "proved":
      return 60
    case "downloading":
      return 70
    case "verifying":
      return 85
    case "success":
      return 100
    case "failed":
      return 100
    case "error":
      return 100
    default:
      return 0
  }
}

export function getProofStatusClasses(status: string) {
  switch (status) {
    case "queued":
      return {
        text: "text-chart-2",
        background: "bg-chart-2",
        animate: "animate-progress-pulse",
      }
    case "proving":
      return {
        text: "text-chart-9",
        background: "bg-chart-9",
        animate: "animate-progress-pulse",
      }
    case "proved":
      return {
        text: "text-chart-12",
        background: "bg-chart-12",
        animate: "animate-progress-pulse",
      }
    case "downloading":
      return {
        text: "text-chart-15",
        background: "bg-chart-15",
        animate: "animate-progress-pulse",
      }
    case "verifying":
      return {
        text: "text-primary",
        background: "bg-primary",
        animate: "animate-progress-pulse",
      }
    case "success":
      return {
        text: "text-primary",
        background: "bg-primary",
        animate: "",
      }
    case "failed":
    case "error":
      return {
        text: "text-destructive",
        background: "bg-destructive",
        animate: "",
      }
    default:
      return {
        text: "text-placeholder",
        background: "bg-placeholder",
        animate: "",
      }
  }
}
