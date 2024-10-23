"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"

import Moon from "@/components/svgs/moon.svg"
import Sun from "@/components/svgs/sun.svg"
import System from "@/components/svgs/monitor-cog.svg"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import ThemeIcon from "./ui/ThemeIcon"

const ThemeSwitch = () => {
  const [mounted, setMounted] = useState(false)

  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <Select value={theme} onValueChange={setTheme}>
      <SelectTrigger className="box-content h-3.5 w-fit items-center gap-2 px-2 py-1.5">
        <SelectValue placeholder={<ThemeIcon />} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="light">
          <div className="flex items-center gap-2">
            <Sun /> <span className="sr-only">Light</span>
          </div>
        </SelectItem>
        <SelectItem value="dark">
          <div className="flex items-center gap-2">
            <Moon /> <span className="sr-only">Dark</span>
          </div>
        </SelectItem>
        <SelectItem value="system">
          <div className="flex items-center gap-2">
            <System /> <span className="sr-only">System</span>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  )
}

export default ThemeSwitch
