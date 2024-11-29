import Link from "next/link"
import { ThemeProvider } from "next-themes"

import ActiveLinkDecorator from "@/components/ActiveLinkDecorator"
import HeaderScrollEffects from "@/components/header/HeaderScrollEffects"
import MobileSearchInput from "@/components/header/MobileSearchInput"
import SearchInput from "@/components/header/SearchInput"
import ThemeSwitch from "@/components/header/ThemeSwitch"
import EthProofsLogo from "@/components/svgs/eth-proofs-logo.svg"
import GitHub from "@/components/svgs/github.svg"
import Hamburger from "@/components/svgs/hamburger.svg"
import Heart from "@/components/svgs/heart.svg"
import Magnifier from "@/components/svgs/magnifier.svg"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"

import { cn } from "@/lib/utils"

import { SITE_REPO_URL } from "@/lib/constants"

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
      </head>
      <body className="pb-80">
        <ThemeProvider attribute="class">
          <div className="mx-auto flex max-w-screen-2xl flex-col gap-16 px-4 sm:px-4 md:px-8 xl:px-16">
            <header
              className={cn(
                "sticky top-0 z-10 grid grid-cols-3 items-center py-4",
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
                <SearchInput className="max-md:hidden" />
              </div>

              {/* Header end */}
              <div className="flex justify-end">
                <nav className="flex gap-6 max-md:hidden">
                  <Link
                    href="/#blocks"
                    className="relative h-fit outline-offset-4 hover:text-primary-light"
                  >
                    Proofs
                    <ActiveLinkDecorator match="/" />
                  </Link>
                  <Link
                    href="/learn"
                    className="relative h-fit outline-offset-4 hover:text-primary-light"
                  >
                    Learn
                    <ActiveLinkDecorator match="/learn" />
                  </Link>
                  <ThemeSwitch />
                </nav>

                {/* Mobile */}
                <div className="flex gap-4 md:hidden">
                  <MobileSearchInput />
                  <Drawer>
                    <DrawerTrigger asChild>
                      <Button variant="solid" className="size-[2rem] p-2">
                        <Hamburger />
                      </Button>
                    </DrawerTrigger>
                    <DrawerContent>
                      <DrawerHeader className="space-y-16">
                        <DrawerTitle className="mb-4 flex items-center justify-between gap-4">
                          <Link href="/" className="ms-4">
                            <EthProofsLogo />
                          </Link>
                          <DrawerClose asChild>
                            <Button variant="ghost">Close</Button>
                          </DrawerClose>
                        </DrawerTitle>
                        <DrawerDescription className="space-y-12">
                          <nav>
                            <ul className="space-y-12 text-center">
                              <li className="list-none">
                                <Button variant="ghost" size="lg" asChild>
                                  <Link href="/">Proofs</Link>
                                </Button>
                              </li>
                              <li className="list-none">
                                <Button variant="ghost" size="lg" asChild>
                                  <Link href="/learn">Learn</Link>
                                </Button>
                              </li>
                            </ul>
                          </nav>
                          <div className="flex justify-center">
                            <ThemeSwitch />
                          </div>
                        </DrawerDescription>
                      </DrawerHeader>
                      <DrawerFooter>
                        <nav className="flex justify-center">
                          <Button variant="ghost" size="lg" asChild>
                            <Link href={SITE_REPO_URL}>
                              <GitHub /> GitHub
                            </Link>
                          </Button>
                        </nav>
                      </DrawerFooter>
                    </DrawerContent>
                  </Drawer>
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

              <p className="mb-4 text-center">
                Built with{" "}
                <Heart className="mb-0.5 inline animate-heart-beat text-xl text-primary" />{" "}
                by the{" "}
                <Link
                  href="https://ethereum.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary-light"
                >
                  ethereum.org
                </Link>{" "}
                team
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
