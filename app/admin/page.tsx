import { AdminApiKeyForm } from "@/components/forms/admin-api-key"
import { AdminUserForm } from "@/components/forms/admin-user"
import { LoginForm } from "@/components/forms/login"
import { Card } from "@/components/ui/card"

import { createClient } from "@/utils/supabase/server"

export default async function AdminPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="flex flex-col gap-8">
        <div className="flex justify-center">
          <Card className="flex min-w-96 flex-col gap-4">
            <h2 className="text-2xl font-bold">Login</h2>
            <LoginForm />
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
          <AdminApiKeyForm />
        </Card>
      </div>
    </div>
  )
}
