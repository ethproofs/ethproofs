import { Cluster } from "@/lib/types"

import { AdminApiKeyForm } from "@/components/forms/admin-api-key-form"
import { AdminUserForm } from "@/components/forms/admin-user-form"
import { AdminVerificationKeyForm } from "@/components/forms/admin-verification-key"
import { SignInForm } from "@/components/forms/sign-in-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { db } from "@/db"
import { clusters, teams } from "@/db/schema"
import { createClient } from "@/utils/supabase/server"

export default async function AdminPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const existingTeams = await db.select().from(teams)
  const existingClusters = (await db.select().from(clusters)) as Cluster[]

  if (!user) {
    return (
      <div className="mt-12 flex flex-col gap-8">
        <div className="flex justify-center">
          <Card className="flex min-w-96 flex-col gap-4">
            <CardHeader>
              <CardTitle>sign in</CardTitle>
            </CardHeader>
            <CardContent>
              <SignInForm />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-12 flex flex-col gap-8">
      <div className="flex justify-center gap-8">
        <Card className="flex min-w-96 flex-col gap-4">
          <CardHeader>
            <CardTitle>create user</CardTitle>
          </CardHeader>
          <CardContent>
            <AdminUserForm />
          </CardContent>
        </Card>

        <Card className="flex min-w-96 flex-col gap-4">
          <CardHeader>
            <CardTitle>generate api key</CardTitle>
          </CardHeader>
          <CardContent>
            <AdminApiKeyForm teams={existingTeams} />
          </CardContent>
        </Card>

        <Card className="flex min-w-96 flex-col gap-4">
          <CardHeader>
            <CardTitle>upload verification key</CardTitle>
          </CardHeader>
          <CardContent>
            <AdminVerificationKeyForm clusters={existingClusters} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
