import { revalidateTag } from "next/cache"
import { NextRequest, NextResponse } from "next/server"

const revalidateSecret = process.env.REVALIDATE_SECRET

if (!revalidateSecret) {
  throw new Error("REVALIDATE_SECRET is not set")
}

export async function GET(request: NextRequest) {
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
