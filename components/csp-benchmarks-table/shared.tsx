import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ChartCardProps {
  title: string | React.ReactNode
  children: React.ReactNode
  height?: string | number
  label?: string
}

export function ChartCard({ title, children, height, label }: ChartCardProps) {
  const style = height
    ? { height: typeof height === "number" ? `${height}px` : height }
    : undefined

  return (
    <Card className="w-full space-y-4">
      <CardHeader>
        <div className="flex items-center justify-center">
          <CardTitle className="text-2xl font-normal">{title}</CardTitle>
          {label && (
            <span className="ml-auto font-mono text-xs text-muted-foreground">
              {label}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div style={style}>{children}</div>
      </CardContent>
    </Card>
  )
}

interface EmptyStateProps {
  message: string
}

export function EmptyState({ message }: EmptyStateProps) {
  return <div className="py-8 text-center text-muted-foreground">{message}</div>
}

interface InputSizeSelectorProps {
  sizes: number[]
  selected: number
  onSelect: (size: number) => void
}

export function InputSizeSelector({
  sizes,
  selected,
  onSelect,
}: InputSizeSelectorProps) {
  if (sizes.length <= 1) return null

  return (
    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end sm:gap-2">
      <span className="text-2xl">input size</span>
      <div className="inline-flex h-8 w-full items-center justify-center rounded-md bg-muted p-1 px-0.5 text-muted-foreground sm:w-auto">
        {sizes.map((size) => (
          <button
            key={size}
            type="button"
            onClick={() => onSelect(size)}
            className={`inline-flex flex-1 items-center justify-center whitespace-nowrap rounded-sm px-2 py-1 text-xs font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 sm:px-3 sm:text-sm ${
              selected === size ? "bg-background text-primary shadow-sm" : ""
            }`}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  )
}
