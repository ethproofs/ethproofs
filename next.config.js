/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
  webpack(config, { dev }) {
    if (!dev) {
      const fileLoaderRule = config.module.rules.find((rule) =>
        rule.test?.test?.(".svg")
      )
      fileLoaderRule.exclude = /\.svg$/

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
      {
        protocol: "https",
        hostname: "**.ghost.io",
      },
      {
        protocol: "https",
        hostname: "**.ghost.org",
      },
    ],
  },
}

module.exports = nextConfig
