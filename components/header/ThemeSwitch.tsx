"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"

import ArrowDropdown from "@/components/svgs/arrow-dropdown.svg"
import System from "@/components/svgs/monitor.svg"
import Moon from "@/components/svgs/moon.svg"
import Sun from "@/components/svgs/sun.svg"

import { cn } from "@/lib/utils"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import ThemeIcon from "../ui/theme-icon"

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

  const items = [
    {
      id: "light",
      label: "Light",
      icon: Sun,
    },
    {
      id: "dark",
      label: "Dark",
      icon: Moon,
    },
    {
      id: "system",
      label: "System",
      icon: System,
    },
  ]
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="group box-content flex h-3.5 w-fit items-center gap-2 rounded-full border border-primary px-2 py-1.5 text-primary [&[data-state=open]]:bg-background-highlight">
        <ThemeIcon className="!text-body" />
        <ArrowDropdown className="transition-transform duration-100 group-[&[data-state=open]]:-scale-y-100" />
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        {items.map((item) => (
          <DropdownMenuItem
            key={item.id}
            onClick={() => setTheme(item.id)}
            className={cn(theme === item.id && "bg-background-active")}
          >
            <div className="flex items-center gap-2 p-2.5">
              <item.icon />
              {item.label}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ThemeSwitch
