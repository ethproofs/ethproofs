import * as React from "react"
import { useTheme } from "next-themes"

import Moon from "@/components/svgs/moon.svg"
import Sun from "@/components/svgs/sun.svg"

const ThemeIcon = React.forwardRef<
  SVGSVGElement,
  React.ComponentPropsWithoutRef<"svg">
>((props, ref) => {
  const { resolvedTheme } = useTheme()
  if (resolvedTheme === "light") return <Sun ref={ref} {...props} />
  return <Moon ref={ref} {...props} />
})
ThemeIcon.displayName = "ThemeIcon"

export default ThemeIcon
