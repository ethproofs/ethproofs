import Link from "next/link"
import Script from "next/script"

import AppNavigationMenu from "@/components/AppNavigationMenu"
import LampEffect from "@/components/LampEffect"
import EthProofsLogo from "@/components/svgs/eth-proofs-logo.svg"
import Hamburger from "@/components/svgs/hamburger.svg"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer"
import { Sidebar } from "@/components/ui/sidebar"

import { cn } from "@/lib/utils"

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
          href="/fonts/ibm-plex-mono/IBMPlexMono-Regular.woff2"
          as="font"
          type="font/woff2"
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
      <body className="overflow-x-hidden pb-80">
        <Providers>
          <Sidebar>
            <AppNavigationMenu />
          </Sidebar>

          <div className="relative flex w-full flex-col gap-16 md:w-[calc(100vw_-_var(--sidebar-width))]">
            <LampEffect />

            <div
              className={cn(
                "bg-[url('/images/blocks-and-hashes.svg')] bg-no-repeat",
                "pointer-events-none absolute h-80 w-screen",
                "opacity-75 hue-rotate-180 invert dark:opacity-100 dark:hue-rotate-0 dark:invert-0 max-md:hidden"
              )}
              style={{ backgroundPosition: "100% -6rem" }}
            />

            <div className="pointer-events-none absolute top-0 -z-10 h-[50vh] w-full bg-gradient-to-b from-background to-background/0" />

            <div className="flex h-40 w-full flex-col items-center justify-between gap-4 p-0 md:p-16">
              <header
                id="mobile-header"
                className={cn(
                  "md:hidden", // Mobile only
                  "sticky top-0 z-10 flex w-full items-center justify-between p-6"
                )}
              >
                <Link href="/">
                  <EthProofsLogo className="text-3xl" />
                </Link>

                <Drawer>
                  <DrawerTrigger asChild>
                    <Button
                      variant="outline"
                      className="ms-auto size-[2rem] border-2 p-2"
                    >
                      <Hamburger />
                    </Button>
                  </DrawerTrigger>
                  <DrawerContent>
                    <AppNavigationMenu insideDrawer />
                  </DrawerContent>
                </Drawer>
              </header>
            </div>

            <main className="min-h-[50vh]">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  )
}
