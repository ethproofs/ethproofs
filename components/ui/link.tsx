import { AnchorHTMLAttributes, forwardRef } from "react"
import NextLink, { type LinkProps as NextLinkProps } from "next/link"

import ExternalLink from "@/components/svgs/external-link.svg"

import * as url from "@/lib/url"

type BaseProps = {
  hideArrow?: boolean
  isPartiallyActive?: boolean
  activeClassName?: string
}

export type LinkProps = BaseProps &
  AnchorHTMLAttributes<HTMLAnchorElement> &
  Omit<NextLinkProps, "href">

/**
 * Link wrapper which handles:
 *
 * - Hashed links
 * e.g. <Link href="/page-2/#specific-section">
 *
 * - External links
 * e.g. <Link href="https://example.com/">
 */
export const BaseLink = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { href, children, className, hideArrow, ...props }: LinkProps,
  ref
) {
  if (!href) {
    console.warn("Link component is missing href prop")
    return <a {...props} />
  }

  const isExternal = url.isExternal(href)
  const isHash = url.isHash(href)

  const commonProps = { ref, ...props, className, href }

  if (isExternal) {
    return (
      <a target="_blank" rel="noopener noreferrer" {...commonProps}>
        {children}
        <span className="sr-only">(opens in a new tab)</span>
        {!hideArrow && (
          <ExternalLink className="mb-1 ms-1 inline text-nowrap" />
        )}
      </a>
    )
  }

  if (isHash)
    return (
      <a
        onClick={(e) => {
          e.stopPropagation()
        }}
        {...commonProps}
      >
        {children}
      </a>
    )

  return <NextLink {...commonProps}>{children}</NextLink>
})
BaseLink.displayName = "BaseLink"

const InlineLink = forwardRef<HTMLAnchorElement, LinkProps>(
  (props: LinkProps, ref) => {
    return (
      <BaseLink
        className="font-body text-primary visited:text-primary-visited hover:text-primary-light"
        ref={ref}
        {...props}
      />
    )
  }
)
InlineLink.displayName = "InlineLink"

export default InlineLink
