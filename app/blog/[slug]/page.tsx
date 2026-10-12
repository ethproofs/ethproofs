import type { Metadata } from "next"
import Image from "next/image"
import { notFound } from "next/navigation"

import { getAllPosts, getPostBySlug } from "@/lib/blog"
import { BLOG_IMAGE_SIZES, formatPostDate } from "@/lib/blog.utils"
import { getMetadata } from "@/lib/metadata"

export const dynamic = "force-static"
export const dynamicParams = false

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return (await getAllPosts()).map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) notFound()

  return getMetadata({
    title: post.title,
    description: post.excerpt,
  })
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  return (
    <article className="mx-auto mt-8 flex max-w-4xl flex-1 flex-col px-6">
      {post.featureImage && (
        <div className="relative mb-8 aspect-video w-full overflow-hidden rounded-lg">
          <Image
            src={post.featureImage}
            alt={post.title}
            fill
            priority
            sizes={BLOG_IMAGE_SIZES}
            className="object-cover"
          />
        </div>
      )}

      <header className="mb-8">
        <span className="text-2xl">{post.title}</span>

        <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {post.authors.length > 0 && (
            <div className="flex items-center gap-2">
              {post.authors.map(
                (a) =>
                  a.image && (
                    <Image
                      key={a.name}
                      src={a.image}
                      alt={a.name}
                      width={32}
                      height={32}
                      className="h-8 w-8 rounded-full"
                    />
                  )
              )}
              <span>{post.authors.map((a) => a.name).join(", ")}</span>
            </div>
          )}

          <time dateTime={post.publishedAt.toISOString()}>
            {formatPostDate(post.publishedAt)}
          </time>

          <span>{post.readingTimeText}</span>
        </div>

        {post.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-muted px-3 py-1 text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      <div className="prose prose-neutral max-w-none dark:prose-invert prose-a:break-words prose-a:no-underline prose-blockquote:[quotes:none]">
        <post.Content />
      </div>
    </article>
  )
}
