import { format } from "date-fns"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { getAllPosts } from "@/lib/ghost"
import { getMetadata } from "@/lib/metadata"

export const metadata: Metadata = getMetadata({ title: "Blog" })

export default async function BlogPage() {
  const posts = await getAllPosts()

  return (
    <div className="mx-auto mt-2 flex max-w-screen-xl flex-1 flex-col px-6">
      <div className="mb-8">
        <span className="text-2xl">blog</span>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="hover:opacity-80"
          >
            <Card className="h-full">
              {post.feature_image && (
                <div className="relative aspect-video w-full overflow-hidden rounded-t-lg">
                  <Image
                    src={post.feature_image}
                    alt={post.title ?? "Blog post image"}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <CardHeader>
                <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                <CardDescription>
                  {post.published_at &&
                    format(new Date(post.published_at), "MMMM d, yyyy")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-3 text-sm text-muted-foreground">
                  {post.excerpt}
                </p>
              </CardContent>
              {post.tags && post.tags.length > 0 && (
                <CardFooter>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag.id}
                        className="rounded-full bg-muted px-3 py-1 text-xs"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </CardFooter>
              )}
            </Card>
          </Link>
        ))}
      </div>

      {posts.length === 0 && (
        <div className="flex min-h-[400px] items-center justify-center">
          <p className="text-muted-foreground">No blog posts yet</p>
        </div>
      )}
    </div>
  )
}
