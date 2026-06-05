import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { cn } from "@/lib/utils"

import { DEFAULT_PAGE_SIZE } from "@/lib/constants"

interface DataTableSkeletonProps {
  columns: number
  rows?: number
  showHeader?: boolean
  showPagination?: boolean
  className?: string
}

export function DataTableSkeleton({
  columns,
  rows = DEFAULT_PAGE_SIZE,
  showHeader = true,
  showPagination = false,
  className,
}: DataTableSkeletonProps) {
  const headerCells = Array.from({ length: columns })
  const bodyRows = Array.from({ length: rows })

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="overflow-hidden rounded-md border">
        <Table>
          {showHeader && (
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                {headerCells.map((_, i) => (
                  <TableHead key={i}>
                    <Skeleton className="h-4 w-20" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
          )}
          <TableBody className="[&_tr:last-child]:border-0">
            {bodyRows.map((_, rowIndex) => (
              <TableRow key={rowIndex} className="hover:bg-transparent">
                {headerCells.map((_, cellIndex) => (
                  <TableCell key={cellIndex}>
                    <Skeleton className="h-4 w-full max-w-[120px]" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {showPagination && (
        <div className="flex items-center justify-between px-2">
          <Skeleton className="h-4 w-32" />
          <div className="flex items-center gap-6">
            <Skeleton className="h-8 w-[140px]" />
            <Skeleton className="h-8 w-[120px]" />
            <div className="flex gap-2">
              <Skeleton className="size-8" />
              <Skeleton className="size-8" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
