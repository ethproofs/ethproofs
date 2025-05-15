import * as React from "react"

import { cn } from "@/lib/utils"

type TableProps = React.HTMLAttributes<HTMLTableElement>

const Table = ({ className, ...props }: TableProps) => (
  <div className="relative w-full overflow-auto">
    <table
      className={cn("w-full caption-bottom text-lg", className)}
      {...props}
    />
  </div>
)
Table.displayName = "Table"

type TableHeaderProps = React.HTMLAttributes<HTMLTableSectionElement>

const TableHeader = ({ className, ...props }: TableHeaderProps) => (
  <thead className={cn("text-sm [&_tr]:border-0", className)} {...props} />
)
TableHeader.displayName = "TableHeader"

type TableBodyProps = React.HTMLAttributes<HTMLTableSectionElement>

const TableBody = ({ className, ...props }: TableBodyProps) => (
  <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />
)
TableBody.displayName = "TableBody"

type TableFooterProps = React.HTMLAttributes<HTMLTableSectionElement>

const TableFooter = ({ className, ...props }: TableFooterProps) => (
  <tfoot
    className={cn(
      "border-t bg-background-highlight font-medium [&>tr]:last:border-b-0",
      className
    )}
    {...props}
  />
)
TableFooter.displayName = "TableFooter"

type TableRowProps = React.HTMLAttributes<HTMLTableRowElement>

const TableRow = ({ className, ...props }: TableRowProps) => (
  <tr
    className={cn(
      "border-b border-primary-border transition-colors data-[state=selected]:bg-background-highlight",
      className
    )}
    {...props}
  />
)
TableRow.displayName = "TableRow"

type TableHeadProps = React.ThHTMLAttributes<HTMLTableCellElement>

const TableHead = ({ className, ...props }: TableHeadProps) => (
  <th
    className={cn(
      "h-12 px-4 text-center align-middle font-medium text-body-secondary [&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  />
)
TableHead.displayName = "TableHead"

type TableCellProps = React.TdHTMLAttributes<HTMLTableCellElement>

const TableCell = ({ className, ...props }: TableCellProps) => (
  <td
    className={cn(
      "p-4 text-center align-middle [&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  />
)
TableCell.displayName = "TableCell"

type TableCaptionProps = React.HTMLAttributes<HTMLTableCaptionElement>

const TableCaption = ({ className, ...props }: TableCaptionProps) => (
  <caption
    className={cn("mt-4 text-sm text-body-secondary", className)}
    {...props}
  />
)
TableCaption.displayName = "TableCaption"

export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
}
