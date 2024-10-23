import { useTheme } from "next-themes"

import Moon from "@/components/svgs/moon.svg"
import Sun from "@/components/svgs/sun.svg"

const ThemeIcon = () => {
  const { resolvedTheme } = useTheme()
  if (resolvedTheme === "dark") return <Sun />
  return <Moon />
}

export default ThemeIcon
