"use client"

import { useScrollPosition } from "@/hooks/useScrollPosition"

const HeaderScrollEffects = () => {
  const scrollPosition = useScrollPosition()
  const distance = 8 * 16 // 8 rem, 128px

  const maxBlurPx = 8
  const kBlur = maxBlurPx / distance
  const blur = Math.min(scrollPosition * kBlur, maxBlurPx)
  const bgStyle = {
    backdropFilter: `blur(${blur}px)`,
    "-webkit-backdrop-filter": `blur(${blur}px)`,
  } as React.CSSProperties

  const maxOpacity = 1
  const kOpacity = maxOpacity / distance
  const opacity = Math.min(scrollPosition * kOpacity, maxOpacity)
  const borderStyle = { opacity } as React.CSSProperties

  return (
    <>
      <div
        className="absolute -inset-x-6 inset-y-0 z-[-1] overflow-visible"
        style={bgStyle}
      />
      <div
        className="absolute -inset-x-6 top-full h-px bg-primary"
        style={borderStyle}
      />
    </>
  )
}

export default HeaderScrollEffects
