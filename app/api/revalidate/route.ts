import { revalidateTag } from "next/cache"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const revalidateSecret = process.env.REVALIDATE_SECRET

  if (!revalidateSecret) {
    return new Response("REVALIDATE_SECRET is not set", { status: 500 })
  }

  const { searchParams } = new URL(request.url)
  const secret = searchParams.get("secret")

  if (secret !== revalidateSecret) {
    return new Response("Invalid secret", { status: 401 })
  }

  const tag = searchParams.get("tag")

  if (!tag) {
    return new Response("Tag is required", { status: 400 })
  }

  try {
    revalidateTag(tag)

    return NextResponse.json({
      status: 200,
      revalidated: true,
      now: Date.now(),
      tag,
    })
  } catch (error) {
    console.error(error)
    return new Response("Failed to revalidate", { status: 500 })
  }
}
