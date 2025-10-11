import pino from "pino"
import { SpanStatusCode, trace } from "@opentelemetry/api"

const serviceName = process.env.OTEL_SERVICE_NAME || "ethproofs-api"
const logLevel = process.env.LOG_LEVEL || "info"
const isDevelopment = process.env.NODE_ENV !== "production"

// Create Pino logger
// @opentelemetry/instrumentation-pino will automatically:
// 1. Inject trace context (trace_id, span_id) into all logs
// 2. Send logs to OpenTelemetry LoggerProvider for OTLP export
export const logger = pino({
  level: logLevel,
  base: {
    service: serviceName,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => ({ level: label }),
  },
  // Use pino-pretty in development for readable logs
  ...(isDevelopment && {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "HH:MM:ss.l",
        // This shall be configured to be visible in the terminal logs
        ignore: "pid,hostname,service,trace_id,span_id,trace_flags",
      },
    },
  }),
})

export async function traced<T>(
  operationName: string,
  fn: () => Promise<T>,
  attributes?: Record<string, string | number | boolean>
): Promise<T> {
  const tracer = trace.getTracer(serviceName)

  return tracer.startActiveSpan(operationName, async (span) => {
    try {
      if (attributes) {
        Object.entries(attributes).forEach(([key, value]) => {
          span.setAttribute(key, value)
        })
      }

      const result = await fn()
      span.setStatus({ code: SpanStatusCode.OK })
      return result
    } catch (error) {
      if (error instanceof Error) {
        span.recordException(error)
        span.setStatus({ code: SpanStatusCode.ERROR, message: error.message })
      }
      throw error
    } finally {
      span.end()
    }
  })
}

export function getCurrentTraceId(): string | undefined {
  const span = trace.getActiveSpan()
  return span?.spanContext().traceId
}

export { logger as default }
