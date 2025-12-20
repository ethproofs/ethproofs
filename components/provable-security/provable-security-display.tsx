import { ShieldCheck } from "lucide-react"

import { Card, CardHeader, CardTitle } from "../ui/card"

export function ProvableSecurityDisplay() {
  return (
    <div className="w-full space-y-4">
      <div className="flex items-center">
        <ShieldCheck className="mr-1 size-6" />
        <span className="text-xl">provable security</span>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-base font-normal text-brand-secondary md:text-base lg:text-lg">
            <span>dashboard coming 2026!</span>
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  )
}
