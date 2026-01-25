import { eq } from "drizzle-orm"
import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { type EmailOtpType } from "@supabase/supabase-js"

import { db } from "@/db"
import { teams } from "@/db/schema"
import type { Database } from "@/lib/database.types"

function isValidRedirectPath(path: string): boolean {
  return path.startsWith("/") && !path.startsWith("//")
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get("token_hash")
  const type = searchParams.get("type") as EmailOtpType | null
  const nextParam = searchParams.get("next")
  const next = nextParam && isValidRedirectPath(nextParam) ? nextParam : "/"

  const redirectTo =
    type === "recovery"
      ? new URL("/reset-password", request.url)
      : new URL(next, request.url)

  if (token_hash && type) {
    const response = NextResponse.redirect(redirectTo)

    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })

    if (!error) {
      if (type !== "recovery") {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          const [team] = await db
            .select({ approved: teams.approved })
            .from(teams)
            .where(eq(teams.id, user.id))

          if (!team?.approved) {
            await supabase.auth.signOut()
            return NextResponse.redirect(new URL("/sign-in", request.url))
          }
        }
      }

      return response
    }
  }

  return NextResponse.redirect(new URL("/auth/auth-code-error", request.url))
}
