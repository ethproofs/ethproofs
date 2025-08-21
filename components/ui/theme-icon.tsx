import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

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
