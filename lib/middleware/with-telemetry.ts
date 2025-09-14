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
  requestBodySnippet?: string
}

const sample = (rate: number) => {
  return Math.random() < rate
}

const safeSend = (p: Promise<unknown>) => {
  // Ensure telemetry never explodes the request on success paths
  p.catch((err) => console.error("[telemetry] send failed:", err))
}

const sendReport = async (message: string, report: Report) => {
  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) return

  const formattedReport = JSON.stringify(report, null, 4)
  const text = md`
    ${md.bold(message)}
    ${md.codeBlock(formattedReport, "json")}
  `

  // Send to telegram
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
    console.error("Failed to send report to telegram", error)
  }
}

const getRequestBody = async (request: Request) => {
  if (!request.body) {
    return
  }

  let body: string | undefined
  try {
    // Create both clones upfront before consuming either stream
    const jsonClone = request.clone()
    const textClone = request.clone()
    
    try {
      const parsed = await jsonClone.json()
      body = JSON.stringify(parsed)
    } catch {
      // If JSON parsing fails, use the fresh text clone
      body = await textClone.text()
    }
  } catch (error) {
    console.warn("Could not parse request body:", error)
  }

  return body
}

export const withTelemetry = (
  handler: (request: Request) => Promise<Response>,
  opts?: { sampleRate?: number } // e.g., 0.02 for 2% of non-5xx
) => {
  const sampleRate = opts?.sampleRate ?? 0

  return async (request: Request) => {
    const t0 = performance.now()
    const nowIso = new Date().toISOString()
    const requestBodySnippet = await getRequestBody(request)
    const url = new URL(request.url)

    const reportBase: Report = {
      date: nowIso,
      startTimeMs: Date.now(),
      endTimeMs: Date.now(),
      durationMs: 0,
      method: request.method,
      path: url.pathname,
      requestBodySnippet,
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
            `[timeout warning] ${warn.method} ${warn.path} 500 in ${warn.durationMs.toFixed(1)}ms ${warn.date}`,
            warn
          )
        )
      }, timeoutDelay)
    }

    try {
      const response = await handler(request)
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
      console.log("[telemetry]", line)

      // Always await on 5xx; sample others to avoid latency + cost
      if (status >= 500) {
        await sendReport(line, rep)
      } else if (
        status >= 400 ? sample(Math.max(sampleRate, 0.1)) : sample(sampleRate)
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

      const line = `[unhandled error] ${rep.method} ${rep.path} 500 in ${durationMs.toFixed(1)}ms ${rep.date}`
      console.error("[telemetry]", line, err)

      // Await to maximize chance we capture the crash
      await sendReport(line, rep)

      throw err
    } finally {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }
}
