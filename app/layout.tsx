import Link from "next/link"
import Script from "next/script"

import AppNavigationMenu from "@/components/AppNavigationMenu"
import HeaderScrollEffects from "@/components/header/HeaderScrollEffects"
import LampEffect from "@/components/LampEffect"
import EthProofsLogo from "@/components/svgs/eth-proofs-logo.svg"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/sonner"

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

      <body className="pb-80">
        <Providers>
          <AppNavigationMenu />
          <SidebarInset>
            <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-16 shrink-0 items-center gap-2 border-b px-4 transition-[width,height] ease-linear">
              <SidebarTrigger className="hover:text-secondary -ml-1 hover:bg-transparent" />
              {/* <HeaderScrollEffects />
              <Link href="/" className="md:hidden">
                <EthProofsLogo className="text-3xl" />
              </Link> */}
            </header>

            <div className="relative w-full">
              <div
                className={cn(
                  "max-md:hidden",
                  "bg-[url('/images/blocks-and-hashes.svg')] bg-no-repeat dark:bg-[url('/images/blocks-and-hashes.svg')]",
                  "opacity-75 hue-rotate-180 invert dark:opacity-100 dark:hue-rotate-0 dark:invert-0",
                  "before:absolute before:inset-0 before:-z-10 before:bg-gradient-to-b before:content-[''] before:dark:from-background-accent/10",
                  "pointer-events-none absolute -z-[0] h-1/3 w-full"
                )}
                style={{ backgroundPosition: "calc(50% + 20rem) -6rem" }}
              />

              {/* <LampEffect /> */}

              <main className="isolate min-h-[50vh]">{children}</main>
            </div>
          </SidebarInset>
        </Providers>
        <Toaster />
      </body>
    </html>
  )
}
