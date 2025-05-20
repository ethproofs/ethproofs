import Image from "next/image"
import { type Components } from "react-markdown"

import Link from "@/components/ui/link"

import { Divider } from "../ui/divider"

export const MarkdownComponents: Components = {
  a: ({ children, href }) => <Link href={href}>{children}</Link>,
  img: ({ src = "", alt = "" }) => (
    <Image className="mx-auto block" src={src as string} alt={alt} />
  ),
  h2: ({ children }) => (
    <div>
      <h2 className="text-4xl md:text-5xl">{children}</h2>
      <Divider />
    </div>
  ),
  h3: ({ children }) => <h3 className="!mt-16 text-3xl">{children}</h3>,
  p: ({ children }) => <p className="m-0">{children}</p>,
}
