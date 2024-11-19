import { ThemeProvider } from "next-themes"

import ThemeSwitch from "@/components/header/ThemeSwitch"

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
            <header className="flex h-8 justify-end py-4">
              <ThemeSwitch />
            </header>
            <main className="min-h-[50vh]">{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
