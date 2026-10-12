import fs from "fs"
import path from "path"

import type { MDXContent } from "mdx/types"
import { z } from "zod"

const BLOG_CONTENT_DIR = path.join(process.cwd(), "content/blog")
const MDX_EXTENSION = ".mdx"

const blogPostFrontmatterSchema = z.object({
  title: z.string(),
  publishedAt: z.coerce.date(),
  excerpt: z.string(),
  featureImage: z.string().optional(),
  tags: z.array(z.string()).default([]),
  authors: z
    .array(z.object({ name: z.string(), image: z.string().optional() }))
    .default([]),
})

const blogPostModuleSchema = z.object({
  default: z.custom<MDXContent>((value) => typeof value === "function"),
  frontmatter: blogPostFrontmatterSchema,
  readingTime: z.object({ text: z.string() }),
})

export type BlogPostFrontmatter = z.infer<typeof blogPostFrontmatterSchema>

export interface BlogPost extends BlogPostFrontmatter {
  slug: string
  Content: MDXContent
  readingTimeText: string
}

function getBlogPostSlugs() {
  return fs
    .readdirSync(BLOG_CONTENT_DIR)
    .filter((fileName) => fileName.endsWith(MDX_EXTENSION))
    .map((fileName) => path.basename(fileName, MDX_EXTENSION))
}

async function loadBlogPost(slug: string): Promise<BlogPost> {
  const {
    default: Content,
    frontmatter,
    readingTime,
  } = blogPostModuleSchema.parse(await import(`../content/blog/${slug}.mdx`))

  return { ...frontmatter, slug, Content, readingTimeText: readingTime.text }
}

export async function getAllPosts() {
  const posts = await Promise.all(getBlogPostSlugs().map(loadBlogPost))
  return posts.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
}

export async function getPostBySlug(slug: string) {
  if (!getBlogPostSlugs().includes(slug)) return null

  return loadBlogPost(slug)
}
