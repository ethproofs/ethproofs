"use client"

import { useEffect } from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "../ui/button"

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  function toggleThemeMode() {
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
