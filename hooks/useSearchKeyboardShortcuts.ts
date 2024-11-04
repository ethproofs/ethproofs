import { useEffect } from "react"

/**
 * Custom hook that adds a keyboard shortcut to focus on a specified input element when the "/" key is pressed.
 *
 * @param ref - A React ref object pointing to the input element to be focused.
 *
 * @remarks
 * This hook attaches a keydown event listener to the window object. When the "/" key is pressed, the default action is prevented,
 * and the focus is moved to the input element referenced by the provided ref, unless the input is already focused.
 *
 * @example
 * ```tsx
 * const inputRef = useRef<HTMLInputElement>(null);
 * useSearchKeyboardShortcuts(inputRef);
 *
 * return <input ref={inputRef} />;
 * ```
 */
function useSearchKeyboardShortcuts(ref: React.RefObject<HTMLInputElement>) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "/" || document.activeElement === ref.current) return
      e.preventDefault()
      ref.current?.focus()
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [])
}

export default useSearchKeyboardShortcuts
