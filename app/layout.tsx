import { ThemeProvider } from "next-themes"
import Link from "next/link"

import EthProofsLogo from "@/components/svgs/eth-proofs-logo.svg"
import GitHub from "@/components/svgs/github.svg"
import Hamburger from "@/components/svgs/hamburger.svg"
import Magnifier from "@/components/svgs/magnifier.svg"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import ThemeSwitch from "@/components/ThemeSwitch"

import { cn } from "@/lib/utils"

import { ibmPlexMono, ibmPlexSans } from "./fonts"
import "../styles/globals.css"

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
    <html
      lang="en"
      className={cn(ibmPlexMono.variable, ibmPlexSans.variable)}
      suppressHydrationWarning
    >
      {/* TODO: <head> */}
      <body className="pb-80">
        <ThemeProvider attribute="class">
          <div className="mx-auto flex max-w-screen-2xl flex-col gap-16 px-4 sm:px-4 md:px-8 xl:px-16">
            <header className="flex justify-between pt-4">
              <Link href="/#">
                <EthProofsLogo className="" />
              </Link>

              {/* Tablet */}
              <Input
                type="text"
                className="relative hidden max-w-56 md:max-lg:flex"
                placeholder="Search"
                // TODO: Add magnifier icon; implement search
              />
              {/* Desktop */}
              <Input
                type="text"
                className="relative max-w-96 max-lg:hidden"
                placeholder="Search by slot number / block hash / block number / prover"
                // TODO: Add magnifier icon; implement search
              />
              <nav className="flex gap-6 max-md:hidden">
                <Link
                  href="/proofs"
                  className="h-fit outline-offset-4 hover:text-primary-light"
                >
                  Proofs
                </Link>
                <Link
                  href="/#"
                  className="h-fit outline-offset-4 hover:text-primary-light"
                >
                  About
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
            </header>

            <main className="min-h-[50vh]">{children}</main>

            <footer className="mx-auto mt-16 flex max-w-prose flex-col items-center">
              <Button asChild size="lg">
                <Link
                  href="https://github.com/ethproofs/ethproofs"
                  className="mb-12"
                >
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
                href="https://github.com/ethproofs/ethproofs/issues/new/"
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
