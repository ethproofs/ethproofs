"use client"

import { useScrollPosition } from "@/hooks/useScrollPosition"

// TODO:TEAM - What is this component?
const HeaderScrollEffects = () => {
  const scrollPosition = useScrollPosition()
  const distance = 4 * 16 // 4rem, 64px

  const maxOpacity = 1
  const kOpacity = maxOpacity / distance
  const opacity = Math.min(scrollPosition * kOpacity, maxOpacity)
  const borderStyle = { opacity } as React.CSSProperties

  return (
    <div
      className="absolute inset-x-0 top-full h-px bg-primary"
      style={borderStyle}
    />
  )
}

export default HeaderScrollEffects
