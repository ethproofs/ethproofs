import { cn } from "@/lib/utils"
import { ibmPlexMono, ibmPlexSans } from "./fonts"

import "@/styles/globals.css"

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000"

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "ETH Proofs",
  description: "",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={cn(ibmPlexMono.variable, ibmPlexSans.variable)}>
      <body className="bg-background text-foreground">
        <main className="flex min-h-screen flex-col items-center">
          {children}
        </main>
      </body>
    </html>
  )
}
