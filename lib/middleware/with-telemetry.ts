type Report = {
  date: string
  startTime: number
  endTime: number
  durationMs: number
  errorMessage?: string
}

const logReport = (message: string, report: Report) => {
  console.log(message)
  console.log(report)

  if (report.errorMessage) {
    // send error to discord
    console.log("sending error to discord")
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
      logReport(
        `${request.method} ${request.url} ${response.status} in ${report.durationMs}ms ${report.date}`,
        report
      )
      return response
    } catch (error) {
      report.endTime = new Date().getTime()
      report.durationMs = report.endTime - report.startTime

      if (error instanceof Error) {
        report.errorMessage = error.message
      }

      logReport(
        `[unhandled error] ${request.method} ${request.url} 500 in ${report.durationMs}ms ${report.date}`,
        report
      )

      // forward error to next handler
      throw error
    }
  }
}
