export const getHost = (url: string) => {
  try {
    return new URL(url).host
  } catch (error) {
    console.warn((error as Error).message)
    return ""
  }
}

export const getTwitterHandle = (handle: string) =>
  handle.startsWith("@") ? handle : `@${handle}`

export const isExternal = (href: string): boolean =>
  href.includes("http") ||
  href.includes("mailto:") ||
  href.includes("ipfs") ||
  href.endsWith(".html")

export const isHash = (href: string): boolean => href.startsWith("#")
