// Initialize OpenTelemetry SDK only on server
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Dynamic import to prevent bundling in client
    const { NodeSDK } = await import("@opentelemetry/sdk-node")
    const { getNodeAutoInstrumentations } = await import(
      "@opentelemetry/auto-instrumentations-node"
    )
    const { PinoInstrumentation } = await import(
      "@opentelemetry/instrumentation-pino"
    )

    const { OTLPTraceExporter: OTLPTraceExporterGrpc } = await import(
      "@opentelemetry/exporter-trace-otlp-grpc"
    )
    const { OTLPTraceExporter: OTLPTraceExporterHttp } = await import(
      "@opentelemetry/exporter-trace-otlp-http"
    )
    const { OTLPMetricExporter: OTLPMetricExporterGrpc } = await import(
      "@opentelemetry/exporter-metrics-otlp-grpc"
    )
    const { OTLPMetricExporter: OTLPMetricExporterHttp } = await import(
      "@opentelemetry/exporter-metrics-otlp-http"
    )
    const { OTLPLogExporter: OTLPLogExporterGrpc } = await import(
      "@opentelemetry/exporter-logs-otlp-grpc"
    )
    const { OTLPLogExporter: OTLPLogExporterHttp } = await import(
      "@opentelemetry/exporter-logs-otlp-http"
    )
    const { PeriodicExportingMetricReader } = await import(
      "@opentelemetry/sdk-metrics"
    )
    const { BatchLogRecordProcessor } = await import("@opentelemetry/sdk-logs")

    const serviceName = process.env.OTEL_SERVICE_NAME || "ethproofs-api"
    const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT

    // Only initialize if OTLP endpoint is configured
    if (!otlpEndpoint) {
      console.log(
        "[OpenTelemetry] Disabled. Set OTEL_EXPORTER_OTLP_ENDPOINT to enable observability."
      )
      return
    }

    let headers = {}
    if (process.env.OTEL_EXPORTER_OTLP_HEADERS) {
      try {
        headers = JSON.parse(process.env.OTEL_EXPORTER_OTLP_HEADERS)
      } catch (error) {
        console.error(
          "[OpenTelemetry] Failed to parse OTEL_EXPORTER_OTLP_HEADERS:",
          error
        )
        console.log("[OpenTelemetry] Continuing with empty headers")
      }
    }

    // Determine protocol (gRPC or HTTP)
    const isGrpc =
      process.env.OTLP_PROTOCOL === "grpc" || otlpEndpoint.includes(":4317")

    // Select exporter classes based on protocol
    const OTLPTraceExporter = isGrpc
      ? OTLPTraceExporterGrpc
      : OTLPTraceExporterHttp
    const OTLPMetricExporter = isGrpc
      ? OTLPMetricExporterGrpc
      : OTLPMetricExporterHttp
    const OTLPLogExporter = isGrpc
      ? OTLPLogExporterGrpc
      : OTLPLogExporterHttp

    const sdk = new NodeSDK({
      serviceName,
      traceExporter: new OTLPTraceExporter({
        url: otlpEndpoint,
        headers,
      }),
      metricReader: new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter({
          url: otlpEndpoint,
          headers,
        }),
        exportIntervalMillis: 60000,
      }),
      logRecordProcessor: new BatchLogRecordProcessor(
        new OTLPLogExporter({
          url: otlpEndpoint,
          headers,
        })
      ),
      instrumentations: [
        new PinoInstrumentation({
          // Inject trace context into Pino logs
          logKeys: {
            traceId: "trace_id",
            spanId: "span_id",
            traceFlags: "trace_flags",
          },
          // Explicitly enable log sending (default is false in some versions)
          disableLogSending: false,
          // Do NOT disable log correlation
          disableLogCorrelation: false,
        }),
        getNodeAutoInstrumentations({
          // Auto-instrument fetch, http, https, and other Node.js modules
          "@opentelemetry/instrumentation-fs": {
            enabled: false, // Disable filesystem instrumentation (too noisy)
          },
          "@opentelemetry/instrumentation-net": {
            enabled: false, // Disable net instrumentation
          },
        }),
      ],
    })

    try {
      sdk.start()
      console.log(
        `[OpenTelemetry] Observability initialized for ${serviceName}`
      )
      console.log(`  - Traces:  exporting to ${otlpEndpoint}`)
      console.log(`  - Metrics: exporting to ${otlpEndpoint} (every 60s)`)
      console.log(`  - Logs:    exporting to ${otlpEndpoint} (Pino → OTel)`)

      // Graceful shutdown
      process.on("SIGTERM", () => {
        sdk
          .shutdown()
          .then(() => console.log("[OpenTelemetry] Observability terminated"))
          .catch((error) =>
            console.error("[OpenTelemetry] Error terminating observability", error)
          )
      })
    } catch (error) {
      console.error("[OpenTelemetry] Failed to initialize observability:", error)
    }
  }
}
