"use client"

import { useMemo } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Radio } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

import { cn } from "@/lib/utils"

import { RealtimeBlockCard } from "./realtime-block-card"
import { useRealtimeSidebar } from "./realtime-sidebar-provider"

import { useBlocksQuery } from "@/lib/hooks/queries/use-blocks-query"
import useRealtimeBlockProofs from "@/lib/hooks/realtime/use-realtime-block-proofs"

const REALTIME_SIDEBAR_WIDTH = "320px"

function RealtimeSidebarContent() {
  useRealtimeBlockProofs()
  const { data, isLoading, error } = useBlocksQuery({
    pageIndex: 0,
    pageSize: 10,
    machineType: "all",
  })

  const blocksSorted = useMemo(() => {
    return (data?.rows ?? []).sort((a, b) => b.block_number - a.block_number)
  }, [data?.rows])

  const blocksToDisplay = useMemo(() => {
    return blocksSorted
      .filter((block) => (block.proofs ?? []).length > 0)
      .slice(0, 8)
  }, [blocksSorted])

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 border-b">
        <div className="flex items-center justify-between p-5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">real-time proving</span>
            <div className="flex items-center gap-1">
              <span className="size-1.5 animate-pulse rounded-full bg-primary" />
              <span className="text-xs text-primary">live</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="flex items-center justify-center gap-2 p-4">
            <span className="text-xs text-muted-foreground">loading...</span>
          </div>
        )}
        {error && (
          <div className="p-4">
            <span className="text-xs text-destructive">
              error: {error.message}
            </span>
          </div>
        )}
        {!isLoading && !error && blocksToDisplay.length === 0 && (
          <div className="p-4">
            <span className="text-xs text-muted-foreground">
              no active proofs
            </span>
          </div>
        )}
        {!isLoading && !error && blocksToDisplay.length > 0 && (
          <div className="space-y-2 p-2">
            <AnimatePresence initial={false} mode="sync">
              {blocksToDisplay.map((block) => (
                <motion.div
                  key={block.block_number}
                  initial={{ y: -50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 50, opacity: 0 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                  <RealtimeBlockCard block={block} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}

export function RealtimeSidebar() {
  const { open, openMobile, setOpenMobile } = useRealtimeSidebar()

  return (
    <>
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent
          side="right"
          className="w-[320px] bg-background p-0 lg:hidden [&>button]:hidden"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>real-time proving</SheetTitle>
            <SheetDescription>live proof status updates</SheetDescription>
          </SheetHeader>
          <RealtimeSidebarContent />
        </SheetContent>
      </Sheet>
      <aside
        className={cn(
          "hidden h-svh flex-col border-l bg-background transition-[width] duration-200 ease-linear lg:flex",
          !open && "w-0 overflow-hidden border-l-0"
        )}
        style={{ width: open ? REALTIME_SIDEBAR_WIDTH : undefined }}
      >
        <div
          className="h-full shrink-0"
          style={{ width: REALTIME_SIDEBAR_WIDTH }}
        >
          <RealtimeSidebarContent />
        </div>
      </aside>
    </>
  )
}

export function RealtimeSidebarTrigger() {
  const { toggle } = useRealtimeSidebar()

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-7 w-7"
      onClick={toggle}
      aria-label="Toggle realtime sidebar"
    >
      <Radio className="size-4" />
    </Button>
  )
}
