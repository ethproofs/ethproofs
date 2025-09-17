"use client"

import { ReactNode, useEffect, useState } from "react"

interface ClientOnlyWrapperProps {
  children: ReactNode
  fallback?: ReactNode
}

/**
 * Wrapper component that only renders children client side to
 * prevent hydration mismatches with components that use browser APIs
 */
export function ClientOnlyWrapper({
  children,
  fallback = null,
}: ClientOnlyWrapperProps) {
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
