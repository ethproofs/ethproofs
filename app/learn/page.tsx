import fs from "fs"

import matter from "gray-matter"

import { MarkdownProvider } from "@/components/Markdown/Provider"

import { LEARN_CONTENT_MD } from "@/lib/constants"

import { getMetadata } from "@/lib/metadata"

export const dynamic = "force-static"

export const metadata = getMetadata({ title: "Learn" })

export default function LearnPage() {
  if (!fs.existsSync(LEARN_CONTENT_MD))
    throw new Error(`Missing Learn page content markdown: ${LEARN_CONTENT_MD}`)

  const contentMarkdown = fs.readFileSync(LEARN_CONTENT_MD, "utf8")
  const { content } = matter(contentMarkdown)

  return (
    <>
      <h1 className="mb-24 mt-16 px-6 text-center text-3xl font-semibold md:mt-24 md:px-8">
        learn <span className="text-primary">&</span> resources
      </h1>

      <div className="mx-auto max-w-screen-md space-y-8 px-6 md:px-8">
        <MarkdownProvider>{content}</MarkdownProvider>
      </div>
    </>
  )
}
