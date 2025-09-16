"use client"

import { useEffect } from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "../ui/button"

const ThemeToggle = () => {
  const { theme, resolvedTheme, setTheme } = useTheme()

  useEffect(() => {
    console.log("theme", theme)
    console.log("resolvedTheme", resolvedTheme)
    if (resolvedTheme && !theme) {
      setTheme(resolvedTheme === "light" ? "light" : "dark")
    }
  }, [])

  const toggleThemeMode = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  if (!theme) return null

  return (
    <Button
      aria-label="Toggle theme"
      variant="ghost"
      size="icon"
      onClick={toggleThemeMode}
      className="aspect-square h-7 w-7"
    >
      {theme === "light" ? <Sun /> : <Moon />}
    </Button>
  )
}

export default ThemeToggle
