import Image from "next/image"
import { type Components } from "react-markdown"

import Link from "@/components/ui/link"

export const MarkdownComponents: Components = {
  a: ({ children, href }) => <Link href={href}>{children}</Link>,
  img: ({ src, alt }) => (
    <Image className="mx-auto block" src={src || ""} alt={alt || ""} />
  ),
}
