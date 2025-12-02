import { AdminApiKeyForm } from "@/components/forms/admin-api-key"
import { AdminUserForm } from "@/components/forms/admin-user"
import { LoginForm } from "@/components/forms/login"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { db } from "@/db"
import { teams } from "@/db/schema"
import { createClient } from "@/utils/supabase/server"

export default async function AdminPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const existingTeams = await db.select().from(teams)

  if (!user) {
    return (
      <div className="mt-12 flex flex-col gap-8">
        <div className="flex justify-center">
          <Card className="flex min-w-96 flex-col gap-4">
            <CardHeader>
              <CardTitle>account login</CardTitle>
            </CardHeader>
            <CardContent>
              <LoginForm />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <h2 className="text-2xl font-bold">Welcome, {user.email}</h2>

      <div className="flex gap-8">
        <Card className="flex min-w-96 flex-col gap-4">
          <h3 className="text-lg font-bold">Create User</h3>
          <AdminUserForm />
        </Card>

        <Card className="flex min-w-96 flex-col gap-4">
          <h3 className="text-lg font-bold">Generate API Key</h3>
          <AdminApiKeyForm teams={existingTeams} />
        </Card>
      </div>
    </div>
  )
}
