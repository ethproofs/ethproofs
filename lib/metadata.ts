import type { Metadata } from "next"
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "./constants"

export const getTitle = (title?: string) =>
  title ? `${title} | ${SITE_NAME}` : SITE_NAME

export const defaults = (title: string = SITE_NAME): Metadata => ({
  metadataBase: new URL(SITE_URL),
  title,
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "hero-background-dark.png", // TODO: Update for production
        alt: "Hero background image", // TODO: Update for production
      },
    ],
  },
  twitter: {
    images: [
      {
        url: "hero-background-dark.png", // TODO: Update for production
        alt: "Hero background image", // TODO: Update for production
      },
    ],
    description: SITE_DESCRIPTION,
    card: "summary_large_image",
    site: SITE_URL,
    title,
  },
})

export const getMetadata = (
  title: string = SITE_NAME,
  overrides?: Partial<Metadata>
): Metadata => ({
  ...defaults(getTitle(title)),
  ...overrides,
})
