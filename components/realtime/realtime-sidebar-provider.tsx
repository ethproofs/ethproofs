"use client"

import * as React from "react"

import { useIsMobile } from "@/lib/hooks/ui/use-is-mobile"

interface RealtimeSidebarContextProps {
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggle: () => void
}

const RealtimeSidebarContext =
  React.createContext<RealtimeSidebarContextProps | null>(null)

export function useRealtimeSidebar() {
  const context = React.useContext(RealtimeSidebarContext)
  if (!context) {
    throw new Error(
      "useRealtimeSidebar must be used within a RealtimeSidebarProvider."
    )
  }
  return context
}

interface RealtimeSidebarProviderProps {
  children: React.ReactNode
  defaultOpen?: boolean
}

export function RealtimeSidebarProvider({
  children,
  defaultOpen = true,
}: RealtimeSidebarProviderProps) {
  const isMobile = useIsMobile()
  const [open, setOpen] = React.useState(defaultOpen)
  const [openMobile, setOpenMobile] = React.useState(false)

  const toggle = React.useCallback(() => {
    return isMobile ? setOpenMobile((prev) => !prev) : setOpen((prev) => !prev)
  }, [isMobile])

  const contextValue = React.useMemo<RealtimeSidebarContextProps>(
    () => ({
      open,
      setOpen,
      openMobile,
      setOpenMobile,
      isMobile: isMobile ?? false,
      toggle,
    }),
    [open, openMobile, isMobile, toggle]
  )

  return (
    <RealtimeSidebarContext.Provider value={contextValue}>
      {children}
    </RealtimeSidebarContext.Provider>
  )
}
