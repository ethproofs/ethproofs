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
