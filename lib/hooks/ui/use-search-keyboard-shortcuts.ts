import { useEffect, useRef } from "react"

function useSearchKeyboardShortcuts() {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "/" || document.activeElement === inputRef.current) return
      e.preventDefault()
      inputRef.current?.focus()
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [])
  return { inputRef }
}

export default useSearchKeyboardShortcuts
