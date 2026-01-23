import Link from "next/link"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AuthCodeErrorPage() {
  return (
    <div className="mt-12 flex flex-col gap-8">
      <div className="flex justify-center">
        <Card className="flex min-w-96 flex-col gap-4">
          <CardHeader>
            <CardTitle>authentication error</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 text-center">
            <p className="text-sm text-muted-foreground">
              the link is invalid or has expired
            </p>
            <Link
              href="/sign-in"
              className="text-sm text-primary hover:underline"
            >
              back to sign in
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
