import { cn } from "@/lib/utils"

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer"
import { Separator } from "../ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet"

import { useIsMobile } from "@/hooks/useIsMobile"

interface DataTableRowViewerProps {
  trigger: React.ReactNode
  title: React.ReactNode
  description: React.ReactNode
  children: React.ReactNode
  className?: string
  onOpenChange?: (open: boolean) => void
}
export function DataTableRowViewer({
  trigger,
  title,
  description,
  children,
  className,
  onOpenChange,
}: DataTableRowViewerProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <Drawer onOpenChange={onOpenChange}>
        <DrawerTrigger asChild>{trigger}</DrawerTrigger>
        <DrawerContent
          className={cn(
            "flex max-h-[80vh] flex-col sm:max-h-[90vh] [&>div.bg-muted]:shrink-0",
            className
          )}
        >
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>{description}</DrawerDescription>
          </DrawerHeader>
          <Separator />
          <div className="flex h-full flex-col overflow-auto">{children}</div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Sheet onOpenChange={onOpenChange}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent
        side="right"
        className={cn(
          "flex flex-col gap-0 border-l-0 p-0 sm:max-w-sm md:w-[400px] md:max-w-[400px] dark:border-l",
          className
        )}
      >
        <SheetHeader className="p-4">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <Separator />
        {children}
      </SheetContent>
    </Sheet>
  )
}
