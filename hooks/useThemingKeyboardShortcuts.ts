import { useEffect } from "react"

function useThemingKeyboardShortcuts(toggleColorMode: () => void) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "\\" || !e.metaKey) return
      e.preventDefault()
      toggleColorMode()
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [toggleColorMode])
}

export default useThemingKeyboardShortcuts
