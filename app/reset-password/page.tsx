import { ResetPasswordForm } from "@/components/forms/reset-password-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ResetPasswordPage() {
  return (
    <div className="mt-12 flex flex-col gap-8">
      <div className="flex justify-center">
        <Card className="flex min-w-96 flex-col gap-4">
          <CardHeader>
            <CardTitle>set new password</CardTitle>
          </CardHeader>
          <CardContent>
            <ResetPasswordForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
