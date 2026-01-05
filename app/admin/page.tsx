import { eq } from "drizzle-orm"

import { Cluster } from "@/lib/types"

import { AdminApiKeyForm } from "@/components/forms/admin-api-key-form"
import { AdminUserForm } from "@/components/forms/admin-user-form"
import { AdminVerificationKeyForm } from "@/components/forms/admin-verification-key"
import { SignInForm } from "@/components/forms/sign-in-form"
import { PendingTeamsList } from "@/components/pending-teams-list"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { API_KEY_MANAGER_ROLE } from "@/lib/constants"

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
  const pendingTeams = await db
    .select()
    .from(teams)
    .where(eq(teams.approved, false))

  if (!user || user.role !== API_KEY_MANAGER_ROLE) {
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
    <div className="mt-12 flex w-full flex-col gap-8 px-48">
      <div className="flex justify-center gap-8">
        <Card className="flex flex-1 flex-col gap-4">
          <CardHeader>
            <CardTitle>create user</CardTitle>
          </CardHeader>
          <CardContent>
            <AdminUserForm />
          </CardContent>
        </Card>

        <Card className="flex flex-1 flex-col gap-4">
          <CardHeader>
            <CardTitle>generate api key</CardTitle>
          </CardHeader>
          <CardContent>
            <AdminApiKeyForm teams={existingTeams} />
          </CardContent>
        </Card>

        <Card className="flex flex-1 flex-col gap-4">
          <CardHeader>
            <CardTitle>upload verification key</CardTitle>
          </CardHeader>
          <CardContent>
            <AdminVerificationKeyForm clusters={existingClusters} />
          </CardContent>
        </Card>
      </div>

      {pendingTeams.length > 0 && (
        <div className="flex justify-center">
          <Card className="flex flex-1 flex-col gap-4">
            <CardHeader>
              <CardTitle>pending teams</CardTitle>
            </CardHeader>
            <CardContent>
              <PendingTeamsList teams={pendingTeams} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
