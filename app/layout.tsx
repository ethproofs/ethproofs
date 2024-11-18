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
        <link rel="icon" href="/icon.svg" type="image/svg" sizes="any" />
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
