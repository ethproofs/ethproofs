import * as React from "react"
import { useTheme } from "next-themes"

import Moon from "@/components/svgs/moon.svg"
import Sun from "@/components/svgs/sun.svg"

type ThemeIconProps = React.ComponentProps<"svg">

const ThemeIcon = (props: ThemeIconProps) => {
  const { resolvedTheme } = useTheme()
  if (resolvedTheme === "light") return <Sun {...props} />
  return <Moon {...props} />
}
ThemeIcon.displayName = "ThemeIcon"

export default ThemeIcon
