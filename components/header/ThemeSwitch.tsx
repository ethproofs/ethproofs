"use client"

import { useEffect, useState } from "react"
import { Monitor, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

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
      label: "light",
      icon: Sun,
    },
    {
      id: "dark",
      label: "dark",
      icon: Moon,
    },
    {
      id: "system",
      label: "system",
      icon: Monitor,
    },
  ]
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="[&[data-state=open]]:text-primary-active group box-content flex h-fit items-center gap-2 rounded-full p-2 text-primary hover:text-primary-light">
        <ThemeIcon />
      </DropdownMenuTrigger>

      <DropdownMenuContent className="space-y-0 p-px">
        {items.map((item) => (
          <DropdownMenuItem
            key={item.id}
            onClick={() => setTheme(item.id)}
            className={cn(
              "rounded-none",
              "first-of-type:rounded-t-[calc(1rem_-_1px)]",
              "last-of-type:rounded-b-[calc(1rem_-_1px)]",
              theme === item.id && "bg-background-active"
            )}
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
