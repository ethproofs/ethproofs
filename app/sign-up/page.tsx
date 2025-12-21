import Link from "next/link"
import { redirect } from "next/navigation"

import { SignUpForm } from "@/components/forms/sign-up-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { createClient } from "@/utils/supabase/server"

export const metadata = {
  title: "Team Sign Up",
}

export default async function SignUpPage() {
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
            <CardTitle>sign up</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <SignUpForm />
            <div className="text-center text-sm text-muted-foreground">
              already have an account?{" "}
              <Link href="/sign-in" className="underline hover:text-foreground">
                sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
