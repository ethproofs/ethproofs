import ReactMarkdown from "react-markdown"

import { MarkdownComponents } from "./Components"

export const MarkdownProvider = (props: { children: string }) => (
  <ReactMarkdown components={MarkdownComponents} {...props} />
)
