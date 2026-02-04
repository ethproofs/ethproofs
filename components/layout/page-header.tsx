import { cn } from "@/lib/utils"

interface PageHeaderProps {
  title: React.ReactNode
  description?: string
  className?: string
}

export function PageHeader({ title, description, className }: PageHeaderProps) {
  return (
    <div className={cn("mb-6 space-y-1 lg:mb-8 lg:space-y-2", className)}>
      <h1 className="text-lg font-semibold sm:text-xl lg:text-xl xl:text-2xl">
        {title}
      </h1>
      {description && (
        <p className="text-xs text-muted-foreground lg:text-base">
          {description}
        </p>
      )}
    </div>
  )
}
