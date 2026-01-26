import { md } from "@vlad-yakovlev/telegram-md"

const LAMBDA_TIMEOUT_MS = 30000
const RUNTIME = process.env.NEXT_RUNTIME ?? "node" // "edge" | "node"
const TIMEOUT_HEADROOM_MS = Number(
  process.env.TELEMETRY_TIMEOUT_HEADROOM_MS ?? 2000
)
const FUNCTION_TIMEOUT_MS = Number(
  process.env.FUNCTION_TIMEOUT_MS ?? LAMBDA_TIMEOUT_MS
)

const TELEGRAM_URL = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`

type Report = {
  date: string
  startTimeMs: number
  endTimeMs: number
  durationMs: number
  method: string
  path: string
  statusCode?: number
  errorMessage?: string
  sampled?: boolean
  // TODO:TEAM - add requestBodySnippet later if needed
  // requestBodySnippet?: string
}

const sample = (rate: number) => {
  return Math.random() < rate
}

// Paths where 404 is expected during retries (not actual errors)
const isExpected404 = (path: string) => {
  return (
    path.includes("/api/proofs/download/") ||
    path.includes("/api/verification-keys/download/") ||
    path.includes("/api/v0/proofs/download/") ||
    path.includes("/api/v0/verification-keys/download/")
  )
}

const isExpected401 = (path: string) => {
  return path.startsWith("/api/v0/")
}

const safeSend = (p: Promise<unknown>) => {
  // Ensure telemetry never explodes the request on success paths
  p.catch((err) => console.error("[Telemetry] send failed:", err))
}

const sendReport = async (message: string, report: Report) => {
  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) return

  const formattedReport = JSON.stringify(report, null, 4)
  const text = md`
    ${md.bold(message)}
    ${md.codeBlock(formattedReport, "json")}
  `

  // Send to Telegram
  const response = await fetch(TELEGRAM_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: process.env.TELEGRAM_CHAT_ID,
      text: md.build(text),
      parse_mode: "MarkdownV2",
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    console.error("Failed to send report to Telegram", error)
  }
}

export const withTelemetry = <
  T extends Record<string, unknown> = Record<string, unknown>,
>(
  handler: (request: Request, params: T) => Promise<Response>,
  opts?: { sampleRate?: number } // e.g., 0.02 for 2% of non-5xx
) => {
  const sampleRate = opts?.sampleRate ?? 0

  return async (request: Request, params: T) => {
    const t0 = performance.now()
    const nowIso = new Date().toISOString()
    const url = new URL(request.url)

    const reportBase: Report = {
      date: nowIso,
      startTimeMs: Date.now(),
      endTimeMs: Date.now(),
      durationMs: 0,
      method: request.method,
      path: url.pathname,
    }

    // Pre-timeout warning
    const enableTimeoutWarn =
      Number.isFinite(FUNCTION_TIMEOUT_MS) && FUNCTION_TIMEOUT_MS > 0
    const timeoutDelay = Math.max(FUNCTION_TIMEOUT_MS - TIMEOUT_HEADROOM_MS, 0)

    let timeoutId: ReturnType<typeof setTimeout> | undefined

    if (enableTimeoutWarn) {
      timeoutId = setTimeout(() => {
        const end = performance.now()
        const durationMs = end - t0
        const warn: Report = {
          ...reportBase,
          endTimeMs: Date.now(),
          durationMs,
          statusCode: 500,
          errorMessage: `${RUNTIME} function timeout imminent`,
        }
        safeSend(
          sendReport(
            `[Timeout] ${warn.method} ${warn.path} 500 in ${warn.durationMs.toFixed(1)}ms ${warn.date}`,
            warn
          )
        )
      }, timeoutDelay)
    }

    try {
      const response = await handler(request, params)
      const end = performance.now()
      const durationMs = end - t0

      const status = response.status
      const rep: Report = {
        ...reportBase,
        endTimeMs: Date.now(),
        durationMs,
        statusCode: status,
      }

      const line = `${rep.method} ${rep.path} ${status} in ${durationMs.toFixed(1)}ms ${rep.date}`
      console.log("[Telemetry]", line)

      // Always await on 5xx; sample others to avoid latency + cost
      // Skip telemetry reporting for expected 404s (retried downloads) and 401s on public APIs
      const shouldReport =
        status >= 500 ||
        (status >= 400 &&
          !(status === 404 && isExpected404(rep.path)) &&
          !(status === 401 && isExpected401(rep.path)))

      if (status >= 500) {
        await sendReport(line, rep)
      } else if (
        shouldReport &&
        (status >= 400 ? sample(Math.max(sampleRate, 0.1)) : sample(sampleRate))
      ) {
        safeSend(sendReport(line, rep)) // fire-and-forget
      }

      return response
    } catch (err) {
      const end = performance.now()
      const durationMs = end - t0

      const rep: Report = {
        ...reportBase,
        endTimeMs: Date.now(),
        durationMs,
        statusCode: 500,
        errorMessage: err instanceof Error ? err.message : "Unknown error",
      }

      const line = `[Unhandled Error] ${rep.method} ${rep.path} 500 in ${durationMs.toFixed(1)}ms ${rep.date}`
      console.error("[Telemetry]", line, err)

      // Await to maximize chance we capture the crash
      await sendReport(line, rep)

      throw err
    } finally {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }
}
