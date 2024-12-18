import fs from "fs"

import matter from "gray-matter"
import Image from "next/image"

import { MarkdownProvider } from "@/components/Markdown/Provider"

import { cn } from "@/lib/utils"

import { LEARN_CONTENT_MD } from "@/lib/constants"

import { getMetadata } from "@/lib/metadata"
import HeroDark from "@/public/images/learn-hero-background.png"

export const metadata = getMetadata({ title: "Learn" })

export default function LearnPage() {
  if (!fs.existsSync(LEARN_CONTENT_MD))
    throw new Error(`Missing Learn page content markdown: ${LEARN_CONTENT_MD}`)

  const contentMarkdown = fs.readFileSync(LEARN_CONTENT_MD, "utf8")
  const { content } = matter(contentMarkdown)

  return (
    <div className="space-y-16">
      <div
        className="absolute inset-0 -z-10 h-[28rem] md:max-xl:h-96"
        style={{ mask: "linear-gradient(180deg, white 80%, transparent)" }}
      >
        <Image
          src={HeroDark}
          style={{
            mask: "radial-gradient(circle, white 60%, transparent 90%)",
            objectPosition: "50% 40%", // Position center of boxes
          }}
          className={cn(
            "mx-auto h-full w-full max-w-screen-2xl object-cover",
            "opacity-80 contrast-[110%] hue-rotate-180 invert", // Light mode filters
            "dark:opacity-100 dark:contrast-100 dark:hue-rotate-0 dark:invert-0" // Dark mode filter resets
          )}
          alt=""
          priority
        />
      </div>
      <div className="!mt-48 flex w-full flex-col items-center justify-between gap-4 p-3 md:mt-44 xl:!mt-56">
        <h1 className="w-full text-center font-mono font-semibold">
          Learn <span className="text-primary">&</span> resources
        </h1>
        <p className="max-w-2xl text-center text-lg">
          How zkEVM Transforms Smart Contracts with Zero-Knowledge Proofs
        </p>
      </div>

      <div className="mx-auto max-w-screen-md space-y-8 md:mt-16 lg:mt-32 xl:mt-48">
        <MarkdownProvider>{content}</MarkdownProvider>
      </div>
    </div>
  )
}
