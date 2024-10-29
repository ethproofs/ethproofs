"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"

import Moon from "@/components/svgs/moon.svg"
import Sun from "@/components/svgs/sun.svg"
import System from "@/components/svgs/monitor.svg"
import { Select, SelectContent, SelectItem, SelectTrigger } from "./ui/select"
import ThemeIcon from "./ui/theme-icon"
import useThemingKeyboardShortcuts from "@/hooks/useThemingKeyboardShortcuts"

const ThemeSwitch = () => {
  const [mounted, setMounted] = useState(false)

  const { theme, resolvedTheme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleColorMode = () => {
    setTheme(resolvedTheme === "light" ? "dark" : "light")
  }

  useThemingKeyboardShortcuts(toggleColorMode)

  if (!mounted) return null

  return (
    <Select value={theme} onValueChange={setTheme}>
      <SelectTrigger className="box-content h-3.5 w-fit items-center gap-2 px-2 py-1.5">
        <ThemeIcon className="!text-body" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="light">
          <div className="flex items-center gap-2">
            <Sun /> Light
          </div>
        </SelectItem>
        <SelectItem value="dark">
          <div className="flex items-center gap-2">
            <Moon /> Dark
          </div>
        </SelectItem>
        <SelectItem value="system">
          <div className="flex items-center gap-2">
            <System /> System
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  )
}

export default ThemeSwitch
