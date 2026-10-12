import Image from "next/image"

import { cn } from "@/lib/utils"

import { BLOG_IMAGE_SIZES, getPublicImageSize } from "@/lib/blog.utils"

interface BlogImageProps {
  src: string
  alt: string
  className?: string
}

export async function BlogImage({ src, alt, className }: BlogImageProps) {
  const size = await getPublicImageSize(src)

  return (
    <Image
      src={src}
      alt={alt}
      width={size?.width ?? 0}
      height={size?.height ?? 0}
      sizes={BLOG_IMAGE_SIZES}
      className={cn(
        "mx-auto h-auto max-w-full rounded-lg",
        !size && "w-full",
        className
      )}
    />
  )
}
