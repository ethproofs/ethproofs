import { ForgotPasswordForm } from "@/components/forms/forgot-password-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ForgotPasswordPage() {
  return (
    <div className="mt-12 flex flex-col gap-8">
      <div className="flex justify-center">
        <Card className="flex min-w-96 flex-col gap-4">
          <CardHeader>
            <CardTitle>reset password</CardTitle>
          </CardHeader>
          <CardContent>
            <ForgotPasswordForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
