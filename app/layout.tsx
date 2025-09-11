import { Suspense } from "react"
import { Heart, Moon } from "lucide-react"
import Script from "next/script"

import AppSidebar from "@/components/sidebar/AppSidebar"
import SearchInput from "@/components/header/SearchInput"
import ThemeSwitch from "@/components/header/ThemeSwitch"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"

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
        {/* https://nextjs.org/docs/app/api-reference/file-conventions/metadata/app-icons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" sizes="any" />
        <link
          rel="apple-touch-icon"
          href="/apple-icon.png"
          type="image/png"
          sizes="180x180"
        />
        <Script
          strategy="afterInteractive"
          data-domain="ethproofs.org"
          src="https://plausible.io/js/script.file-downloads.outbound-links.tagged-events.js"
        />
        <Script
          id="plausible-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
            window.plausible = window.plausible || function() {
              (window.plausible.q = window.plausible.q || []).push(arguments)
            }
          `,
          }}
        />
      </head>

      <body>
        <Providers>
          <AppSidebar />
          <SidebarInset className="flex min-h-screen flex-col">
            <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear">
              <div className="flex w-full items-center justify-between px-4">
                <SidebarTrigger className="-ml-1 text-primary hover:bg-transparent hover:text-primary-light" />
                <div className="flex items-center gap-2">
                  <Suspense
                    fallback={
                      <div className="flex h-fit items-center gap-2">
                        <Moon className="animate-pulse text-primary" />
                      </div>
                    }
                  >
                    <ThemeSwitch />
                  </Suspense>
                  <SearchInput
                    aria-label="search by block"
                    placeholder="search by block"
                  />
                </div>
              </div>
              {/* <HeaderScrollEffects />
              <Link href="/" className="md:hidden">
                <EthProofsLogo className="text-3xl" />
              </Link> */}
            </header>

            <div className="relative w-full flex-1">
              {/* <div
                className={cn(
                  "max-md:hidden",
                  "bg-[url('/images/blocks-and-hashes.svg')] bg-no-repeat dark:bg-[url('/images/blocks-and-hashes.svg')]",
                  "opacity-75 hue-rotate-180 invert dark:opacity-100 dark:hue-rotate-0 dark:invert-0",
                  "before:absolute before:inset-0 before:-z-10 before:bg-gradient-to-b before:content-[''] before:dark:from-background-accent/10",
                  "pointer-events-none absolute -z-[0] h-1/3 w-full"
                )}
                style={{ backgroundPosition: "calc(50% + 20rem) -6rem" }}
              /> */}

              {/* <LampEffect /> */}

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
