import type { MetadataRoute } from "next"

import { isNetlifyProduction } from "@/lib/constants"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: isNetlifyProduction
      ? {
          userAgent: "*",
          allow: "/",
        }
      : {
          userAgent: "*",
          disallow: "/",
        },
    host: process.env.SITE_URL,
    sitemap: new URL("/sitemap.xml", process.env.SITE_URL).toString(),
  }
}
