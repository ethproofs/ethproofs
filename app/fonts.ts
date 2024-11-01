import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google"

export const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-ibm-plex-sans",
})

export const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-ibm-plex-mono",
})
