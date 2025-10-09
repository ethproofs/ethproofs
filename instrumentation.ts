// Initialize OpenTelemetry SDK only on server
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Dynamic import to prevent bundling in client
    const { NodeSDK } = await import("@opentelemetry/sdk-node")
    const { getNodeAutoInstrumentations } = await import(
      "@opentelemetry/auto-instrumentations-node"
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
    const {
      LoggerProvider,
      BatchLogRecordProcessor,
    } = await import("@opentelemetry/sdk-logs")
    const { logs } = await import("@opentelemetry/api-logs")
    const { resourceFromAttributes } = await import("@opentelemetry/resources")
    const { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } = await import(
      "@opentelemetry/semantic-conventions"
    )

    const serviceName = process.env.OTEL_SERVICE_NAME || "ethproofs-api"
    const serviceVersion = process.env.npm_package_version || "0.2.0"
    const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT

    // Only initialize if OTLP endpoint is configured
    if (!otlpEndpoint) {
      console.log(
        "[OpenTelemetry] Disabled. Set OTEL_EXPORTER_OTLP_ENDPOINT to enable observability."
      )
      return
    }

    const headers = process.env.OTEL_EXPORTER_OTLP_HEADERS
      ? JSON.parse(process.env.OTEL_EXPORTER_OTLP_HEADERS)
      : {}

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

    // Create shared resource with service information
    const resource = resourceFromAttributes({
      [ATTR_SERVICE_NAME]: serviceName,
      [ATTR_SERVICE_VERSION]: serviceVersion,
    })

    // Initialize Logs Provider with resource
    const loggerProvider = new LoggerProvider({
      resource,
      processors: [
        new BatchLogRecordProcessor(
          new OTLPLogExporter({
            url: otlpEndpoint,
            headers,
          })
        ),
      ],
    })
    logs.setGlobalLoggerProvider(loggerProvider)

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
      instrumentations: [
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
      console.log(`  - Logs:    exporting to ${otlpEndpoint}`)

      // Graceful shutdown
      process.on("SIGTERM", () => {
        Promise.all([
          sdk.shutdown(),
          loggerProvider.shutdown(),
        ])
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
