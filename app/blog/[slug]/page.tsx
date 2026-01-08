import { format } from "date-fns"
import type { Metadata } from "next"
import Image from "next/image"
import { notFound } from "next/navigation"

import { getAllPosts, getPostBySlug } from "@/lib/ghost"
import { getMetadata } from "@/lib/metadata"

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const posts = await getAllPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    return getMetadata({ title: "Post Not Found" })
  }

  return getMetadata({
    title: post.title,
    description: post.excerpt || post.meta_description || undefined,
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
      {post.feature_image && (
        <div className="relative mb-8 aspect-video w-full overflow-hidden rounded-lg">
          <Image
            src={post.feature_image}
            alt={post.title ?? "Blog post image"}
            fill
            className="object-cover"
          />
        </div>
      )}

      <header className="mb-8">
        <span className="text-2xl">{post.title}</span>

        <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {post.authors && post.authors.length > 0 && (
            <div className="flex items-center gap-2">
              {post.authors.map(
                (a) =>
                  a.profile_image && (
                    <Image
                      key={a.name}
                      src={a.profile_image}
                      alt={a.name ?? "Author profile image"}
                      width={32}
                      height={32}
                      className="h-8 w-8 rounded-full"
                    />
                  )
              )}
              <span>{post.authors.map((a) => a.name).join(", ")}</span>
            </div>
          )}

          {post.published_at && (
            <time dateTime={post.published_at}>
              {format(new Date(post.published_at), "MMMM d, yyyy")}
            </time>
          )}

          {post.reading_time && <span>{post.reading_time} min read</span>}
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag.id}
                className="rounded-full bg-muted px-3 py-1 text-xs"
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </header>

      <div
        className="prose prose-neutral max-w-none dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: post.html || "" }}
      />
    </article>
  )
}
