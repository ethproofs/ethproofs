/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack(config) {
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
