"use client"

import { useScrollPosition } from "@/hooks/useScrollPosition"

const HeaderScrollEffects = () => {
  const scrollPosition = useScrollPosition()
  const distance = 8 * 16 // 8 rem, 128px

  const maxOpacity = 1
  const kOpacity = maxOpacity / distance
  const opacity = Math.min(scrollPosition * kOpacity, maxOpacity)

  const maxBlurPx = 8
  const kBlur = maxBlurPx / distance
  const blur = Math.min(scrollPosition * kBlur, maxBlurPx)

  return (
    <>
      <div
        className="absolute inset-0 z-[-1] overflow-visible"
        style={{
          backdropFilter: `blur(${blur}px)`,
          backgroundColor: `rgba(var(--background), ${opacity})`,
        }}
      />
      <div
        className="absolute top-full h-px w-full bg-primary"
        style={{ opacity }}
      />
    </>
  )
}

export default HeaderScrollEffects
