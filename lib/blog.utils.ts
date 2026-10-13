import { isValidElement, type ReactNode } from "react"

export const BLOG_IMAGE_SIZES = "(min-width: 896px) 896px, 100vw"
export const BLOG_CARD_IMAGE_SIZES =
  "(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"

const GHOST_SLUG_STRIPPED_CHARACTERS = /[\][!"#$%&'()*+,./:;<=>?@\\^_`{|}~]/g
const SITE_HOSTNAMES = ["ethproofs.org", "www.ethproofs.org"]
const postDateFormat = new Intl.DateTimeFormat("en-US", {
  dateStyle: "long",
  timeZone: "UTC",
})

export function formatPostDate(date: Date) {
  return postDateFormat.format(date)
}

export function getNodeText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node)
  if (Array.isArray(node)) return node.map(getNodeText).join("")
  if (isValidElement<{ children?: ReactNode }>(node))
    return getNodeText(node.props.children)
  return ""
}

export function getGhostHeadingId(text: string) {
  return encodeURIComponent(
    text
      .replace(GHOST_SLUG_STRIPPED_CHARACTERS, "")
      .trim()
      .replace(/\s+/g, "-")
      .toLowerCase()
  )
}

export function getSiteRelativeHref(href: string) {
  if (!URL.canParse(href)) return null

  const url = new URL(href)
  if (!SITE_HOSTNAMES.includes(url.host)) return null

  return `${url.pathname}${url.search}${url.hash}`
}
