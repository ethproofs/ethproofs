import type { ComponentProps } from "react"

import { getGhostHeadingId, getNodeText } from "@/lib/blog.utils"

interface HeadingProps extends ComponentProps<"h1"> {
  as: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
}

export function Heading({ as: Tag, children, ...props }: HeadingProps) {
  return (
    <Tag id={getGhostHeadingId(getNodeText(children))} {...props}>
      {children}
    </Tag>
  )
}
