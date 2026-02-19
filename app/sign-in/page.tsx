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
          <CardContent>
            <SignInForm />
            <div className="mt-2 text-center text-sm text-muted-foreground">
              need an account?{" "}
              <Link
                className="text-sm text-muted-foreground hover:text-primary"
                href="https://x.com/eth_proofs"
              >
                X
              </Link>{" "}
              or{" "}
              <Link
                className="text-sm text-muted-foreground hover:text-primary"
                href="https://t.me/ethproofs_community"
              >
                Telegram
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
