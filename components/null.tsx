interface NullProps {
  children?: React.ReactNode
  hidePlaceholder?: boolean
}

export function Null({ children, hidePlaceholder = false }: NullProps) {
  return (
    <span className="text-muted-foreground">
      {children || hidePlaceholder ? "\u00A0" : "-"}
    </span>
  )
}
