export const withTelemetry = (
  handler: (request: Request) => Promise<Response>
) => {
  return async (request: Request) => {
    const startTime = new Date()
    const response = await handler(request)
    const endTime = new Date()
    const duration = endTime.getTime() - startTime.getTime()
    console.log(`Request duration: ${duration}ms`)
    return response
  }
}
