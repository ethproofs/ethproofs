import type { MDXComponents } from "mdx/types"

import { BlogImage } from "@/components/blog/blog-image"
import { Callout } from "@/components/blog/callout"
import { Figure } from "@/components/blog/figure"
import { Heading } from "@/components/blog/heading"
import Link from "@/components/ui/link"

import { cn } from "@/lib/utils"

import { getSiteRelativeHref } from "@/lib/blog.utils"
import * as url from "@/lib/url"

const components: MDXComponents = {
  a({ href = "", className, children, ...props }) {
    if (url.isHash(href))
      return (
        <a
          href={href}
          className={cn("text-primary hover:text-primary-light", className)}
          {...props}
        >
          {"data-footnote-ref" in props ? <>[{children}]</> : children}
        </a>
      )

    return (
      <Link href={getSiteRelativeHref(href) ?? href} hideArrow {...props}>
        {children}
      </Link>
    )
  },
  img({ src = "", alt = "" }) {
    return <BlogImage src={src} alt={alt} />
  },
  table(props) {
    return (
      <div className="overflow-x-auto">
        <table {...props} />
      </div>
    )
  },
  section(props) {
    if (!("data-footnotes" in props)) return <section {...props} />

    return (
      <>
        <hr />
        <section {...props} />
      </>
    )
  },
  h1(props) {
    return <Heading as="h1" {...props} />
  },
  h2(props) {
    return <Heading as="h2" {...props} />
  },
  h3(props) {
    return <Heading as="h3" {...props} />
  },
  h4(props) {
    return <Heading as="h4" {...props} />
  },
  h5(props) {
    return <Heading as="h5" {...props} />
  },
  h6(props) {
    return <Heading as="h6" {...props} />
  },
  Callout,
  Figure,
}

export function useMDXComponents(): MDXComponents {
  return components
}
