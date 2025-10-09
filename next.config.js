/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: [
    "@opentelemetry/sdk-node",
    "@opentelemetry/auto-instrumentations-node",
    "@opentelemetry/exporter-trace-otlp-grpc",
    "@opentelemetry/exporter-trace-otlp-http",
    "@opentelemetry/exporter-metrics-otlp-grpc",
    "@opentelemetry/exporter-metrics-otlp-http",
    "@opentelemetry/exporter-logs-otlp-grpc",
    "@opentelemetry/exporter-logs-otlp-http",
    "@opentelemetry/sdk-metrics",
    "@opentelemetry/sdk-logs",
    "@opentelemetry/resources",
    "@opentelemetry/semantic-conventions",
  ],
  webpack(config, { isServer }) {
    const fileLoaderRule = config.module.rules.find((rule) =>
      rule.test?.test?.(".svg")
    )
    fileLoaderRule.exclude = /\.svg$/

    // Convert all other *.svg imports to React components
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: fileLoaderRule.issuer,
      resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] }, // exclude if *.svg?url
      use: ["@svgr/webpack"],
    })

    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    }

    // Exclude OpenTelemetry from client bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        child_process: false,
        stream: false,
      }
    }

    return config
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ibkqxhjnroghhtfyualc.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/public-assets/**",
      },
    ],
  },
}

module.exports = nextConfig
