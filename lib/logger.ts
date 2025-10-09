import { context, SpanStatusCode, trace } from "@opentelemetry/api"
import { logs, SeverityNumber } from "@opentelemetry/api-logs"

type LogLevel = "debug" | "info" | "warn" | "error"

interface LogContext {
  [key: string]: unknown
}

const severityMap: Record<LogLevel, SeverityNumber> = {
  debug: SeverityNumber.DEBUG,
  info: SeverityNumber.INFO,
  warn: SeverityNumber.WARN,
  error: SeverityNumber.ERROR,
}

class Logger {
  private serviceName: string
  private baseContext: LogContext
  private otelLogger: ReturnType<ReturnType<typeof logs.getLoggerProvider>["getLogger"]> | null = null

  constructor(serviceName: string = "ethproofs", baseContext: LogContext = {}) {
    this.serviceName = serviceName
    this.baseContext = baseContext

    // Get OTel logger if available (after instrumentation is initialized)
    try {
      this.otelLogger = logs.getLoggerProvider().getLogger(serviceName)
    } catch (e) {
      // OTel not initialized yet, will fall back to console only
      this.otelLogger = null
      console.warn("[Logger] OpenTelemetry logger not initialized, using console only")
    }
  }

  private getTraceContext() {
    const span = trace.getActiveSpan()
    if (!span) return {}

    const spanContext = span.spanContext()
    return {
      trace_id: spanContext.traceId,
      span_id: spanContext.spanId,
    }
  }

  private log(level: LogLevel, message: string, ctx?: LogContext) {
    const timestamp = new Date().toISOString()
    const traceContext = this.getTraceContext()

    const logContext = {
      ...this.baseContext,
      ...(ctx || {}),
    }

    const logEntry = {
      timestamp,
      level,
      service: this.serviceName,
      message,
      ...traceContext,
      ...logContext,
    }

    // Send to OpenTelemetry if available
    if (this.otelLogger) {
      this.otelLogger.emit({
        severityNumber: severityMap[level],
        severityText: level.toUpperCase(),
        body: message,
        attributes: {
          ...logContext,
          service: this.serviceName,
        } as Record<string, string | number | boolean | (string | number | boolean)[]>,
      })
    }

    // Also output to console for local development visibility
    const logString = JSON.stringify(logEntry)
    if (level === "error") {
      console.error(logString)
    } else if (level === "warn") {
      console.warn(logString)
    } else {
      console.log(logString)
    }
  }

  debug(message: string, ctx?: LogContext) {
    this.log("debug", message, ctx)
  }

  info(message: string, ctx?: LogContext) {
    this.log("info", message, ctx)
  }

  warn(message: string, ctx?: LogContext) {
    this.log("warn", message, ctx)
  }

  error(message: string, error?: Error | unknown, ctx?: LogContext) {
    const errorContext: LogContext = {
      ...ctx,
    }

    if (error instanceof Error) {
      errorContext.error_message = error.message
      errorContext.error_stack = error.stack
      errorContext.error_name = error.name
    } else if (error) {
      errorContext.error = error
    }

    this.log("error", message, errorContext)

    // Also record error in active span if available
    const span = trace.getActiveSpan()
    if (span && error instanceof Error) {
      span.recordException(error)
      span.setStatus({ code: SpanStatusCode.ERROR, message: error.message })
    }
  }

  /**
   * Create a child logger with additional context that will be included in all log entries
   * @param ctx - Context to include in all logs from this child logger
   * @returns A new Logger instance with merged context
   */
  child(ctx: LogContext): Logger {
    return new Logger(this.serviceName, { ...this.baseContext, ...ctx })
  }
}

const serviceName = process.env.OTEL_SERVICE_NAME || "ethproofs-api"

// Export singleton instance
export const logger = new Logger(serviceName)

// Helper function to create traced operations
export async function traced<T>(
  operationName: string,
  fn: () => Promise<T>,
  attributes?: Record<string, string | number | boolean>
): Promise<T> {
  const tracer = trace.getTracer("ethproofs")

  return tracer.startActiveSpan(operationName, async (span) => {
    try {
      // Add custom attributes to span
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

// Helper to get current trace ID for correlation
export function getCurrentTraceId(): string | undefined {
  const span = trace.getActiveSpan()
  return span?.spanContext().traceId
}
