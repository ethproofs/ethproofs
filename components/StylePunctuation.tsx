import { cn } from "@/lib/utils"

import Null from "./Null"

type StylePunctuationProps = {
  children: string
  className: string
}

const StylePunctuation = ({
  children,
  className,
}: StylePunctuationProps): React.ReactNode[] =>
  children.split("").map((char, i) => {
    if (/[\d]/g.test(char)) return char
    return (
      <span key={i} className={className}>
        {char}
      </span>
    )
  })

interface HidePunctuationProps {
  children: string
  className?: string
}
const HidePunctuation = ({ children, className }: HidePunctuationProps) => {
  if (children === "-") return <Null />
  return (
    <StylePunctuation className={cn("invisible select-none", className)}>
      {children}
    </StylePunctuation>
  )
}

export { HidePunctuation, StylePunctuation }
