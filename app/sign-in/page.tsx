import Link from "next/link"
import { redirect } from "next/navigation"

import { SignInForm } from "@/components/forms/sign-in-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { createClient } from "@/utils/supabase/server"

export const metadata = {
  title: "Team Login",
}

export default async function LoginPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/teams")
  }

  return (
    <div className="mt-12 flex flex-col gap-8">
      <div className="flex justify-center">
        <Card className="flex min-w-96 flex-col gap-4">
          <CardHeader>
            <CardTitle>sign in</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <SignInForm />
            {/* <div className="text-center text-sm text-muted-foreground">
              don&apos;t have an account?{" "}
              <Link href="/sign-up" className="underline hover:text-foreground">
                sign up
              </Link>
            </div> */}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
