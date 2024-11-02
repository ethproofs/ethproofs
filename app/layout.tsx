/* eslint-disable simple-import-sort/imports */

import { ThemeProvider } from "next-themes"
import Link from "next/link"

import ActiveLinkDecorator from "@/components/ActiveLinkDecorator"
import HeaderScrollEffects from "@/components/HeaderScrollEffects"
import EthProofsLogo from "@/components/svgs/eth-proofs-logo.svg"
import GitHub from "@/components/svgs/github.svg"
import Hamburger from "@/components/svgs/hamburger.svg"
import Magnifier from "@/components/svgs/magnifier.svg"
import ThemeSwitch from "@/components/ThemeSwitch"
import { Button } from "@/components/ui/button"

import { cn } from "@/lib/utils"

import { SITE_REPO_URL } from "@/lib/constants"

import DesktopSearch from "@/components/DesktopSearch"
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
      </head>
      <body className="pb-80">
        <ThemeProvider attribute="class">
          <div className="mx-auto flex max-w-screen-2xl flex-col gap-16 px-4 sm:px-4 md:px-8 xl:px-16">
            <header
              className={cn(
                "relative sticky top-0 z-10 grid grid-cols-3 items-center py-4",
                "-mx-4 sm:-mx-4 md:-mx-8 xl:-mx-16",
                "px-4 sm:px-4 md:px-8 xl:px-16"
              )}
            >
              <HeaderScrollEffects />

              {/* Header start */}
              <div className="flex">
                <Link href="/">
                  <EthProofsLogo />
                </Link>
              </div>

              {/* Header center */}
              <div className="flex justify-center">
                <DesktopSearch />
              </div>

              {/* Header end */}
              <div className="flex justify-end">
                <nav className="flex gap-6 max-md:hidden">
                  <Link
                    href="/"
                    className="relative h-fit outline-offset-4 hover:text-primary-light"
                  >
                    Proofs
                    <ActiveLinkDecorator match="/" />
                  </Link>
                  <Link
                    href="/about"
                    className="relative h-fit outline-offset-4 hover:text-primary-light"
                  >
                    About
                    <ActiveLinkDecorator match="/about" />
                  </Link>
                  <ThemeSwitch />
                </nav>

                {/* Mobile */}
                <div className="flex gap-4 md:hidden">
                  <Button variant="solid" className="size-[2rem] p-2">
                    {/* TODO: Implement search */}
                    <Magnifier />
                  </Button>
                  <Button variant="solid" className="size-[2rem] p-2">
                    <Hamburger />
                  </Button>
                </div>
              </div>
            </header>

            <main className="min-h-[50vh]">{children}</main>

            <footer className="mx-auto mt-16 flex max-w-prose flex-col items-center">
              <Button asChild size="lg">
                <Link href={SITE_REPO_URL} className="mb-12">
                  <GitHub className="size-6" />
                  <span>Contribute to ETH Proofs</span>
                </Link>
              </Button>

              <p className="text-center">
                Lorem ipsum dolor sit, amet consectetur adipisicing elit.
                Similique facere temporibus minima quibusdam ratione.
              </p>
              <p className="text-center text-lg text-primary-light">
                Public goods are good
              </p>

              <Link
                href={new URL("/issues/new/", SITE_REPO_URL).toString()}
                className="mt-8 text-center text-body-secondary"
              >
                Spot a bug? Report it here
              </Link>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
