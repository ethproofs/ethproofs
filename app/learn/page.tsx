import fs from "fs"

import matter from "gray-matter"

import { MarkdownProvider } from "@/components/Markdown/Provider"

import { LEARN_CONTENT_MD } from "@/lib/constants"

import { getMetadata } from "@/lib/metadata"

export const metadata = getMetadata({ title: "Learn" })

export default function LearnPage() {
  if (!fs.existsSync(LEARN_CONTENT_MD))
    throw new Error(`Missing Learn page content markdown: ${LEARN_CONTENT_MD}`)

  const contentMarkdown = fs.readFileSync(LEARN_CONTENT_MD, "utf8")
  const { content } = matter(contentMarkdown)

  return (
    <>
      <div className="absolute top-16 w-full space-y-12 px-6 text-center font-mono font-semibold sm:px-8 md:px-12 lg:px-16 xl:px-20">
        <h1
          className="text-3xl"
          style={{
            textShadow: `
              0 0 3rem hsla(var(--background-modal)),
              0 0 2rem hsla(var(--background-modal)),
              0 0 1rem hsla(var(--background-modal)),
              0 0 1rem hsla(var(--background-modal))`,
          }}
        >
          learn <span className="text-primary">&</span> resources
        </h1>
      </div>

      <div className="w-screen md:w-[calc(100vw_-_var(--sidebar-width))]">
        <div className="mx-auto max-w-screen-md space-y-8 px-8 md:px-12">
          <MarkdownProvider>{content}</MarkdownProvider>
        </div>
      </div>
    </>
  )
}
