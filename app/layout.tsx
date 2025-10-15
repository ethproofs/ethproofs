import { Heart } from "lucide-react"

import { ClientOnlyWrapper } from "@/components/ClientOnlyWrapper"
import { BlockSearch } from "@/components/header/BlockSearch"
import ThemeToggle from "@/components/header/ThemeToggle"
import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { Toaster } from "@/components/ui/sonner"

import Providers from "./providers"

import "../styles/globals.css"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="preload"
          href="/fonts/lock-sans/LockSansTRIAL-Regular.otf"
          as="font"
          type="font/otf"
          crossOrigin="anonymous"
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" sizes="any" />
        <link
          rel="apple-touch-icon"
          href="/apple-icon.png"
          type="image/png"
          sizes="180x180"
        />
      </head>

      <body>
        <Providers>
          <AppSidebar />
          <SidebarInset className="flex min-h-screen flex-col overflow-x-hidden">
            <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear">
              <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <div className="flex items-center gap-2">
                  <ClientOnlyWrapper
                    fallback={<Skeleton className="h-7 w-7 rounded-md" />}
                  >
                    <ThemeToggle />
                  </ClientOnlyWrapper>
                  <BlockSearch />
                </div>
              </div>
            </header>

            <div className="relative w-full flex-1 overflow-x-hidden">
              <main className="isolate min-h-[50vh]">{children}</main>
            </div>
            <footer className="mt-20 flex h-20 flex-col items-center justify-center border-t">
              <div className="flex flex-row items-center justify-center gap-2">
                made with{" "}
                <Heart className="mb-0.5 inline size-4 text-xl text-primary motion-safe:animate-heart-beat" />{" "}
                by the Ethereum Foundation
              </div>
            </footer>
          </SidebarInset>
        </Providers>
        <Toaster />
      </body>
    </html>
  )
}
