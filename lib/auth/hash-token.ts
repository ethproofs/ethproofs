const secret = process.env.SECRET

export const hashToken = async (token: string) => {
  if (!secret) {
    throw new Error("SECRET is not set")
  }

  const encoder = new TextEncoder()

  const data = encoder.encode(`${token}${secret}`)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))

  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}
