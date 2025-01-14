import { md } from "@vlad-yakovlev/telegram-md"

type Report = {
  date: string
  startTime: number
  endTime: number
  durationMs: number
  statusCode?: number
  errorMessage?: string
  requestBody?: string
}

const sendReport = async (message: string, report: Report) => {
  const formattedReport = JSON.stringify(report, null, 4)
  const text = md`
    ${md.bold(message)}
    ${md.codeBlock(formattedReport, "json")}
  `

  // send to telegram
  const telegramUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`
  const response = await fetch(telegramUrl, {
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

  try {
    return await request.json()
  } catch (_error) {
    return await request.text()
  }
}

export const withTelemetry = (
  handler: (request: Request) => Promise<Response>
) => {
  return async (request: Request) => {
    const report: Report = {
      date: new Date().toISOString(),
      startTime: new Date().getTime(),
      endTime: new Date().getTime(),
      durationMs: 0,
    }

    try {
      const response = await handler(request)

      report.endTime = new Date().getTime()
      report.durationMs = report.endTime - report.startTime
      report.statusCode = response.status

      const message = `${request.method} ${request.url} ${report.statusCode} in ${report.durationMs}ms ${report.date}`
      if (report.statusCode !== 200) {
        report.requestBody = await getRequestBody(request)
        sendReport(message, report)
      }

      console.log(message)

      return response
    } catch (error) {
      report.endTime = new Date().getTime()
      report.durationMs = report.endTime - report.startTime
      report.statusCode = 500
      report.requestBody = await getRequestBody(request)

      if (error instanceof Error) {
        report.errorMessage = error.message
      }

      const message = `[unhandled error] ${request.method} ${request.url} ${report.statusCode} in ${report.durationMs}ms ${report.date}`

      sendReport(message, report)

      console.log(message)

      // forward error to next handler
      throw error
    }
  }
}
