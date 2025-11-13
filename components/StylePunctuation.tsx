import { Null } from "./Null"

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

type HidePunctuationProps = {
  children: string
}

const HidePunctuation = ({ children }: HidePunctuationProps) => {
  if (children === "-") return <Null />
  return (
    <StylePunctuation className="invisible select-none">
      {children}
    </StylePunctuation>
  )
}

export { HidePunctuation, StylePunctuation }
